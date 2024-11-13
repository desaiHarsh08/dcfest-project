package com.dcfest.services.impl;

import com.dcfest.dtos.CollegeRepresentativeDto;
import com.dcfest.exceptions.ResourceNotFoundException;
import com.dcfest.models.CollegeModel;
import com.dcfest.models.CollegeRepresentativeModel;
import com.dcfest.repositories.CollegeRepository;
import com.dcfest.repositories.CollegeRepresentativeRepository;
import com.dcfest.services.CollegeRepresentativeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CollegeRepresentativeServiceImpl implements CollegeRepresentativeService {

    @Autowired
    private CollegeRepresentativeRepository representativeRepository;

    @Autowired
    private CollegeRepository collegeRepository;

    @Override
    public CollegeRepresentativeDto createRepresentative(CollegeRepresentativeDto representativeDto) {
        CollegeRepresentativeModel representative = mapToEntity(representativeDto);
        CollegeRepresentativeModel savedRepresentative = representativeRepository.save(representative);
        return mapToDto(savedRepresentative);
    }

    @Override
    public CollegeRepresentativeDto updateRepresentative(CollegeRepresentativeDto representativeDto) {
        Optional<CollegeRepresentativeModel> existingRepresentative = representativeRepository.findById(representativeDto.getId());
        if (existingRepresentative.isEmpty()) {
            throw new RuntimeException("Representative not found");
        }
        CollegeRepresentativeModel representative = existingRepresentative.get();
        representative.setName(representativeDto.getName());
        representative.setEmail(representativeDto.getEmail());
        representative.setPhone(representativeDto.getPhone());
        representative.setWhatsappNumber(representativeDto.getWhatsappNumber());
        representative.setCollege(new CollegeModel(representativeDto.getCollegeId())); // Set College using ID

        CollegeRepresentativeModel updatedRepresentative = representativeRepository.save(representative);
        return mapToDto(updatedRepresentative);
    }

    @Override
    public boolean deleteRepresentative(Long id) {
        representativeRepository.deleteById(id);
        return true;
    }

    @Override
    public CollegeRepresentativeDto getRepresentativeById(Long id) {
        CollegeRepresentativeModel representative = representativeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Representative not found for id: " + id));
        return mapToDto(representative);
    }

    @Override
    public List<CollegeRepresentativeDto> getRepresentativesByCollege(Long collegeId) {
        CollegeModel college = collegeRepository.findById(collegeId).orElseThrow(
                () -> new ResourceNotFoundException("College not found")
        );

        return representativeRepository.findByCollege(college).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private CollegeRepresentativeDto mapToDto(CollegeRepresentativeModel representative) {
        return new CollegeRepresentativeDto(
                representative.getId(),
                representative.getCollege().getId(),
                representative.getName(),
                representative.getEmail(),
                representative.getPhone(),
                representative.getWhatsappNumber()
        );
    }

    private CollegeRepresentativeModel mapToEntity(CollegeRepresentativeDto dto) {
        CollegeRepresentativeModel representative = new CollegeRepresentativeModel();
        representative.setId(dto.getId());
        representative.setCollege(new CollegeModel(dto.getCollegeId()));
        representative.setName(dto.getName());
        representative.setEmail(dto.getEmail());
        representative.setPhone(dto.getPhone());
        representative.setWhatsappNumber(dto.getWhatsappNumber());
        return representative;
    }
}
