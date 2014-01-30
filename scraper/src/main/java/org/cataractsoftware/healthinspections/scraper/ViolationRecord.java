package org.cataractsoftware.healthinspections.scraper;

/**
 * @author Christopher Fagiani
 */
public class ViolationRecord {
    private String code;
    private String text;
    private String note;
    private boolean repeat;
    private String response;

    public ViolationRecord() {
    }

    public ViolationRecord(String code, String text, String note, String response, boolean repeat) {
        this.code = code;
        this.text = text;
        this.note = note;
        this.response = response;
        this.repeat = repeat;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String toString() {
        return "code: " + code + " text: " + text + " repeat: " + repeat + " note: " + note + " response: " + response;
    }

    public boolean isRepeat() {
        return repeat;
    }

    public void setRepeat(boolean repeat) {
        this.repeat = repeat;
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }
}
