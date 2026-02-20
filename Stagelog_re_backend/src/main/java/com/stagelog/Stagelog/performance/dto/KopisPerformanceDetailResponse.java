package com.stagelog.Stagelog.performance.dto;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JacksonXmlRootElement(localName = "dbs")
public class KopisPerformanceDetailResponse {

    @JacksonXmlElementWrapper(useWrapping = false)
    @JacksonXmlProperty(localName = "db")
    private List<KopisPerformanceDetailItem> details;

    public KopisPerformanceDetailItem getFirstDetail() {
        return (details != null && !details.isEmpty()) ? details.get(0) : null;
    }
}
