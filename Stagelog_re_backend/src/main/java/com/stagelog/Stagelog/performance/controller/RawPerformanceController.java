package com.stagelog.Stagelog.performance.controller;

import com.stagelog.Stagelog.performance.domain.KopisPerformance;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RawPerformanceController {

    @PostMapping("/api/mm")
    public ResponseEntity<Void> create(@RequestBody KopisPerformance kopisPerformance) {

        System.out.println("create");
        return null;
    }
}
