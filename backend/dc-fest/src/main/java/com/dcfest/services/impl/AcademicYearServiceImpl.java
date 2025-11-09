package com.dcfest.services.impl;

import com.dcfest.dtos.AcademicYearDto;
import com.dcfest.exceptions.ResourceNotFoundException;
import com.dcfest.models.AcademicYearModel;
import com.dcfest.repositories.AcademicYearRepository;
import com.dcfest.services.AcademicYearService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AcademicYearServiceImpl implements AcademicYearService {

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    @Autowired
    private com.dcfest.services.WebSocketService webSocketService;

    @Override
    public AcademicYearDto createAcademicYear(AcademicYearDto academicYearDto) {
        AcademicYearModel academicYearModel = this.modelMapper.map(academicYearDto, AcademicYearModel.class);
        
        // If this is set as active, deactivate all others
        if (academicYearModel.isActive()) {
            List<AcademicYearModel> activeYears = academicYearRepository.findAll().stream()
                    .filter(AcademicYearModel::isActive)
                    .collect(Collectors.toList());
            for (AcademicYearModel year : activeYears) {
                year.setActive(false);
                academicYearRepository.save(year);
            }
        }
        
        academicYearModel = this.academicYearRepository.save(academicYearModel);
        return this.academicYearModelToDto(academicYearModel);
    }

    @Override
    public List<AcademicYearDto> getAllAcademicYears() {
        List<AcademicYearModel> academicYearModels = this.academicYearRepository.findAll();
        
        if (academicYearModels.isEmpty()) {
            return new ArrayList<>();
        }
        
        return academicYearModels.stream()
                .map(this::academicYearModelToDto)
                .collect(Collectors.toList());
    }

    @Override
    public AcademicYearDto getAcademicYearById(Long id) {
        AcademicYearModel academicYearModel = this.academicYearRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No academic year exist for id: " + id));
        
        return this.academicYearModelToDto(academicYearModel);
    }

    @Override
    public AcademicYearDto getActiveAcademicYear() {
        AcademicYearModel academicYearModel = this.academicYearRepository.findByIsActiveTrue()
                .orElseThrow(() -> new ResourceNotFoundException("No active academic year found"));
        
        return this.academicYearModelToDto(academicYearModel);
    }

    @Override
    public boolean isRegistrationDeadlineClosed() {
        AcademicYearModel activeAcademicYear = this.academicYearRepository.findByIsActiveTrue()
                .orElse(null);
        
        if (activeAcademicYear == null) {
            // If no active academic year, consider registration as closed
            return true;
        }
        
        LocalDateTime currentDateTime = LocalDateTime.now();
        // Registration is closed if current date >= endDate
        return !currentDateTime.isBefore(activeAcademicYear.getEndDate());
    }

    @Override
    public boolean isRegistrationOpen() {
        AcademicYearModel activeAcademicYear = this.academicYearRepository.findByIsActiveTrue()
                .orElse(null);
        
        if (activeAcademicYear == null) {
            // If no active academic year, registration is not open
            return false;
        }
        
        LocalDateTime currentDateTime = LocalDateTime.now();
        // Registration is open if startDate <= currentDateTime <= endDate
        return !currentDateTime.isBefore(activeAcademicYear.getStartDate()) 
                && currentDateTime.isBefore(activeAcademicYear.getEndDate());
    }

    @Override
    public AcademicYearDto updateAcademicYear(AcademicYearDto academicYearDto) {
        final AcademicYearModel foundAcademicYear = this.academicYearRepository.findById(academicYearDto.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No academic year exist for id: " + academicYearDto.getId()));
        
        // Update fields
        foundAcademicYear.setYear(academicYearDto.getYear());
        foundAcademicYear.setStartDate(academicYearDto.getStartDate());
        foundAcademicYear.setEndDate(academicYearDto.getEndDate());
        
        // Only update isActive if it's explicitly provided in the DTO (not null check)
        // Since boolean defaults to false, we check if the DTO has a non-default value or preserve existing
        // For safety, we'll preserve the existing isActive value unless explicitly changed via setActiveAcademicYear endpoint
        // The isActive field should not be updated through regular update - it should be managed separately
        
        AcademicYearModel savedAcademicYear = this.academicYearRepository.save(foundAcademicYear);
        
        // Emit WebSocket update for registration status
        if (webSocketService != null) {
            webSocketService.emitRegistrationStatusUpdate(isRegistrationOpen());
        }
        
        return this.academicYearModelToDto(savedAcademicYear);
    }

    @Override
    public boolean deleteAcademicYear(Long id) {
        this.academicYearRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No academic year exist for id: " + id));
        
        this.academicYearRepository.deleteById(id);
        return true;
    }

    @Override
    public AcademicYearDto setActiveAcademicYear(Long id) {
        this.academicYearRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No academic year exist for id: " + id));
        
        // Deactivate all other academic years
        List<AcademicYearModel> allYears = this.academicYearRepository.findAll();
        for (AcademicYearModel year : allYears) {
            if (year.getId().equals(id)) {
                year.setActive(true);
            } else {
                year.setActive(false);
            }
            this.academicYearRepository.save(year);
        }
        
        // Fetch the updated model
        AcademicYearModel updatedModel = this.academicYearRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No academic year exist for id: " + id));
        
        // Emit WebSocket update for registration status
        if (webSocketService != null) {
            webSocketService.emitRegistrationStatusUpdate(isRegistrationOpen());
        }
        
        return this.academicYearModelToDto(updatedModel);
    }

    private AcademicYearDto academicYearModelToDto(AcademicYearModel academicYearModel) {
        if (academicYearModel == null) {
            return null;
        }
        return this.modelMapper.map(academicYearModel, AcademicYearDto.class);
    }

}

