package org.cataractsoftware.healthinspections.scraper;

import com.mongodb.*;
import org.cataractsoftware.datasponge.DataRecord;
import org.cataractsoftware.datasponge.writer.AbstractDataWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;
import java.util.Properties;

/**
 * @author Christopher Fagiani
 */
public class MongoDataWriter extends AbstractDataWriter {

    private static final Logger logger = LoggerFactory.getLogger(MongoDataWriter.class);
    private static final String HOST = "mongohost";
    private static final String PORT = "mongoport";
    private static final String DB_NAME = "mongodbname";
    private static final String PASSWORD = "mongopassword";
    private static final String USER = "mongousername";
    private static final String DEFAULT_PORT = "27017";
    private static final String DEFAULT_DB = "data";


    private MongoClient mongoClient;
    private DB mongoDb;

    private DBCollection facilityCollection;
    private DBCollection inspectionCollection;

    @Override
    public void init(Properties props) {
        super.init(props);
        if (props.getProperty(HOST) == null || props.getProperty(HOST).trim().isEmpty()) {
            throw new IllegalStateException(HOST + " must be specified when using the MongoDataWriter");
        }
        int port = Integer.parseInt(props.getProperty(PORT, DEFAULT_PORT));
        String dbName = props.getProperty(DB_NAME, DEFAULT_DB);
        try {
            mongoClient = new MongoClient(props.getProperty(HOST), port);
            mongoDb = mongoClient.getDB(dbName);
            if (props.getProperty(PASSWORD) != null && !props.getProperty(PASSWORD).trim().isEmpty()) {
                if (!mongoDb.authenticate(props.getProperty(USER).trim(), props.getProperty(PASSWORD).trim().toCharArray())) {
                    throw new IllegalStateException("Bad credentials given for mongo. Check values of " + USER + " and " + PASSWORD);
                }
            }
            inspectionCollection = mongoDb.getCollection("inspection");
            facilityCollection = mongoDb.getCollection("facility");
        } catch (Exception e) {
            throw new RuntimeException("Could not connect to mongo", e);
        }

    }


    @Override
    protected void writeItem(DataRecord record) {
        try {
            if ("facility".equalsIgnoreCase(record.getType())) {
                facilityCollection.save(createBasicObject(record, "facilityId"));
            } else if ("inspection".equalsIgnoreCase(record.getType())) {
                inspectionCollection.save(createBasicObject(record, "inspectionId"));
            }
        } catch (MongoException e) {
            logger.warn("error for doc with url " + record.getIdentifier(), e);
        }
    }

    private BasicDBObject createBasicObject(DataRecord record, String idFieldName) {
        BasicDBObject obj = new BasicDBObject("_id", record.getFieldValue(idFieldName));
        for (Map.Entry<String, Object> entry : record.getFields()) {
            if ("violations".equalsIgnoreCase(entry.getKey())) {
                if (entry.getValue() != null) {
                    BasicDBList dbList = new BasicDBList();
                    for (ViolationRecord v : (List<ViolationRecord>) entry.getValue()) {
                        dbList.add(new BasicDBObject("code", v.getCode()).append("text", v.getText()).
                                append("response", v.getResponse()).append("repeat", v.isRepeat()).
                                append("note", v.getNote()));
                    }
                    obj.append("violations", dbList);
                }

            } else if ("inspections".equalsIgnoreCase(entry.getKey())) {
                if (entry.getValue() != null) {
                    BasicDBList dbList = new BasicDBList();
                    for (InspectionRecord insp : (List<InspectionRecord>) entry.getValue()) {
                        dbList.add(new BasicDBObject("id", insp.getId()).append("type", insp.getType()).
                                append("date", insp.getDate()).append("critical-violations", insp.getCriticalViolations()).
                                append("non-critical-violations", insp.getNonCriticalViolations()));
                    }
                    obj.append("inspections", dbList);
                }

            } else if (!idFieldName.equals(entry.getKey()) && entry.getValue() instanceof String) {
                obj.append(entry.getKey(), entry.getValue());
            }
        }
        return obj;
    }

    @Override
    public void finish() {
        mongoClient.close();
    }
}
