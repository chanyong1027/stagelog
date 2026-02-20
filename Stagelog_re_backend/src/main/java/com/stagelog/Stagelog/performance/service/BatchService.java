package com.stagelog.Stagelog.performance.service;

import com.stagelog.Stagelog.global.exception.BatchProcessException;
import com.stagelog.Stagelog.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class BatchService {
    private final JobLauncher jobLauncher;
    private final ApplicationContext applicationContext;

    public void runJob(String jobName, String startDate) {
        try {
            Job job = applicationContext.getBean(jobName, Job.class);

            JobParametersBuilder paramsBuilder = new JobParametersBuilder()
                    .addLong("time", System.currentTimeMillis());

            if (startDate != null) {
                paramsBuilder.addString("startDate", startDate);
            }

            jobLauncher.run(job, paramsBuilder.toJobParameters());
        } catch (Exception e) {
            log.error("배치 실행 중 오류 발생: jobName={}, startDate={}", jobName, startDate, e);
            throw new BatchProcessException(ErrorCode.BATCH_EXECUTION_FAILED, e);
        }
    }
}
