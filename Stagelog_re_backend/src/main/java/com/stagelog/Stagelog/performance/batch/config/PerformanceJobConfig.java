package com.stagelog.Stagelog.performance.batch.config;

import com.stagelog.Stagelog.performance.batch.listener.BatchJobMdcListener;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class PerformanceJobConfig {

    private final JobRepository jobRepository;
    private final Step performanceFetchStep;
    private final Step performanceDetailStep;
    private final BatchJobMdcListener batchJobMdcListener;

    @Bean
    public Job performanceFetchJob() {
        return new JobBuilder("performanceFetchJob", jobRepository)
                .start(performanceFetchStep)
                .listener(batchJobMdcListener)
                .build();
    }

    @Bean
    public Job performanceDetailJob() {
        return new JobBuilder("performanceDetailJob", jobRepository)
                .start(performanceDetailStep)
                .listener(batchJobMdcListener)
                .build();
    }
}
