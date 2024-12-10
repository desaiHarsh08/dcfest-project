package com.dcfest.controllers;

import com.dcfest.dtos.JudgeDto;
import com.dcfest.services.JudgeServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/judges")
public class JudgeController {

    @Autowired
    private JudgeServices judgeServices;

    @PostMapping
    public ResponseEntity<JudgeDto> createJudge(@RequestBody JudgeDto judgeDto) {
        JudgeDto createdJudge = judgeServices.createJudge(judgeDto);
        return new ResponseEntity<>(createdJudge, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<JudgeDto>> getAllJudges() {
        List<JudgeDto> judges = judgeServices.getAllJudges();
        return new ResponseEntity<>(judges, HttpStatus.OK);
    }



    @GetMapping("/{id}")
    public ResponseEntity<JudgeDto> getJudgeById(@PathVariable Long id) {
        JudgeDto judge = judgeServices.getJudgeById(id);
        return new ResponseEntity<>(judge, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJudge(@PathVariable Long id) {
        boolean isDeleted = judgeServices.deleteJudge(id);
        if (isDeleted) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
