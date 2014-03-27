package org.cataractsoftware.healthinspections.scraper;

/**
 * structure to represent geographic coordinates
 *
 * @author Christopher Fagiani
 */
public class GeoPoint {

    private static final String TYPE = "Point";
    private Double lat;
    private Double lon;

    public GeoPoint(Double lat, Double lon) {
        this.lat = lat;
        this.lon = lon;
    }


    public String getType() {
        return TYPE;
    }


    public Double getLat() {
        return lat;
    }

    public Double getLon() {
        return lon;
    }

}
