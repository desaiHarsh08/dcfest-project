package com.dcfest.repositories;

import com.dcfest.models.CollegeModel;
import com.dcfest.models.CollegeRepresentativeModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CollegeRepresentativeRepository extends JpaRepository<CollegeRepresentativeModel, Long> {

    List<CollegeRepresentativeModel> findByCollege(CollegeModel college);

}
