package org.cataractsoftware.healthinspections.scraper;

import java.util.Date;

/**
 * @author Christopher Fagiani
 */
public class InspectionRecord {
    private String id;
    private String type;
    private int criticalViolations = 0;
    private int nonCriticalViolations = 0;
    private Date date;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int getCriticalViolations() {
        return criticalViolations;
    }

    public void setCriticalViolations(int criticalViolations) {
        this.criticalViolations = criticalViolations;
    }

    public int getNonCriticalViolations() {
        return nonCriticalViolations;
    }

    public void setNonCriticalViolations(int nonCriticalViolations) {
        this.nonCriticalViolations = nonCriticalViolations;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }
}
