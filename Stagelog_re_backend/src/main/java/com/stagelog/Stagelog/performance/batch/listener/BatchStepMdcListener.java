package com.stagelog.Stagelog.performance.batch.listener;

import org.slf4j.MDC;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.StepExecutionListener;
import org.springframework.stereotype.Component;

@Component
public class BatchStepMdcListener implements StepExecutionListener {

    private static final String MDC_STEP_NAME = "stepName";
    private static final String MDC_STEP_EXECUTION_ID = "stepExecutionId";

    @Override
    public void beforeStep(StepExecution stepExecution) {
        MDC.put(MDC_STEP_NAME, stepExecution.getStepName());
        MDC.put(MDC_STEP_EXECUTION_ID, String.valueOf(stepExecution.getId()));
    }

    @Override
    public ExitStatus afterStep(StepExecution stepExecution) {
        MDC.remove(MDC_STEP_NAME);
        MDC.remove(MDC_STEP_EXECUTION_ID);
        return stepExecution.getExitStatus();
    }
}
