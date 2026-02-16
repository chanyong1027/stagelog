package com.stagelog.Stagelog.performance.client;

import com.stagelog.Stagelog.performance.dto.KopisPerformanceListItem;
import com.stagelog.Stagelog.performance.dto.KopisPerformanceDetailItem;
import java.util.List;

public interface KopisPerformanceDataProvider {
    List<KopisPerformanceListItem> fetchPerformances(String startDate, String endDate, int currentPage, String category);

    KopisPerformanceDetailItem fetchPerformanceDetail(String kopisId);
}
