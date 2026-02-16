package com.stagelog.Stagelog.performance.controller;

import com.stagelog.Stagelog.performance.service.BatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/batch")
@RequiredArgsConstructor
public class BatchController {
    private final BatchService batchService;

    @PostMapping("/run")
    public String runBatch(
            @RequestParam String jobName,
            @RequestParam(required = false) String startDate) {
        batchService.runJob(jobName, startDate);
        return String.format("배치 실행 요청됨 (Job: %s, Date: %s)", jobName, startDate);
    }
}
