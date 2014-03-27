package org.cataractsoftware.healthinspections.scraper

import groovyx.net.http.RESTClient
import org.slf4j.Logger
import org.slf4j.LoggerFactory

/**
 *
 * updates the data record by adding coordinates retrieved from a geocode api
 * this makes use of an instance of the geocode service defined by this project: https://github.com/cfagiani/geocoder
 *
 * @author Christopher Fagiani
 */
class GeocodeEnhancer {

    private static
    final Logger logger = LoggerFactory.getLogger(GeocodeEnhancer.class);
    final def GEOCODE_HOST_PROP = "geocodeenhancer.geocodeservice"
    String host


    def setProperties(props) {
        host = props.getProperty(GEOCODE_HOST_PROP);
        if (host == null || host.trim().length() == 0) {
            logger.error("You must specify a value for " + GEOCODE_HOST_PROP + " in the property file");
        }
    }


    def enhanceData(dataRecord) {
        if (dataRecord != null && "facility".equalsIgnoreCase(dataRecord.getType())) {
            def geocoder = new RESTClient(host);
            try {
                def resp = geocoder.get(path: "findByAddress", query: [addr: dataRecord.getFieldValue("street"), zip: dataRecord.getFieldValue("zip")])
                try {
                    GeoPoint point = new GeoPoint(resp.data.lat, resp.data.lon);
                    dataRecord.setField("loc", point);
                } catch (ex) {
                    logger.warn("Called geocode service but failed to get a location", ex);
                }
            } catch (ex) {
                logger.warn("Could not fetch geocode for record", ex);
            }
        }
        return dataRecord;
    }

}
