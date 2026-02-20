package com.stagelog.Stagelog.performance.batch.listener;

import org.slf4j.MDC;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobExecutionListener;
import org.springframework.stereotype.Component;

@Component
public class BatchJobMdcListener implements JobExecutionListener {

    private static final String MDC_JOB_NAME = "jobName";
    private static final String MDC_JOB_EXECUTION_ID = "jobExecutionId";
    private static final String MDC_STEP_NAME = "stepName";
    private static final String MDC_STEP_EXECUTION_ID = "stepExecutionId";

    @Override
    public void beforeJob(JobExecution jobExecution) {
        MDC.put(MDC_JOB_NAME, jobExecution.getJobInstance().getJobName());
        MDC.put(MDC_JOB_EXECUTION_ID, String.valueOf(jobExecution.getId()));
    }

    @Override
    public void afterJob(JobExecution jobExecution) {
        MDC.remove(MDC_JOB_NAME);
        MDC.remove(MDC_JOB_EXECUTION_ID);
        MDC.remove(MDC_STEP_NAME);
        MDC.remove(MDC_STEP_EXECUTION_ID);
    }
}
