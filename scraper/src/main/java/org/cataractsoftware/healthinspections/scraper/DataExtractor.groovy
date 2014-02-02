import com.gargoylesoftware.htmlunit.html.HtmlPage
import org.cataractsoftware.datasponge.DataRecord
import org.cataractsoftware.healthinspections.scraper.InspectionRecord
import org.cataractsoftware.healthinspections.scraper.ViolationRecord
import org.slf4j.Logger
import org.slf4j.LoggerFactory

import java.text.DateFormat
import java.text.SimpleDateFormat

class DataExtractor {

    private static final String CATEGORY_PARAM = "RestrictToCategory=";
    private static final DateFormat DATE_FMT = new SimpleDateFormat("dd-MMMMM-yyyy");
    private static final DateFormat SHORT_DATE_FMT = new SimpleDateFormat("dd-MMM-yyyy");
    private static
    final Logger logger = LoggerFactory.getLogger(org.cataractsoftware.datasponge.extractor.DataExtractor.class);


    def extractData(url, page) {
        if (url.contains("InspectionDetails")) {
            buildInspectionRecord(url, page)

        } else if (url.contains("FacilityHistory")) {
            buildFacilityRecord(url, page)
        } else {
            return null
        }
    }


    def buildInspectionRecord(url, page) {
        DataRecord record = new DataRecord(url, "inspection")
        record.setField("inspectionId", extractIdFromUrl(url))
        record.setField("facilityId", extractIdFromUrl(page.getByXPath("//a[contains(@href,'FacilityHistory')]").get(0).getAttribute("href")))
        record.setField("type", page.getByXPath("//tr//*[contains(.,'Inspection type')]").get(0).getNextSibling()?.getFirstChild().getTextContent()?.trim());
        def dateString = page.getByXPath("//tr//*[contains(.,'Inspection date')]").get(0).getNextSibling()?.getFirstChild().getTextContent()?.trim();
        if (dateString != null) {
            try {
                record.setField("date", DATE_FMT.parse(dateString));
            } catch (Exception e) {
                logger.warn("Could not parse date", e);
            }
        }

        def violations = page.getByXPath("//table[@cellspacing='3']//tr")
        if (violations != null) {
            def violationList = []
            for (v in violations) {
                String fullText = v.getFirstChild()?.getFirstChild()?.getTextContent()

                if (fullText != null) {
                    String code = ""
                    String desc = ""
                    String response = null

                    if (fullText.contains("/")) {
                        code = fullText.substring(0, fullText.indexOf("/")).trim()
                        desc = fullText.substring(fullText.indexOf("/") + 1).trim()
                    }
                    String repeatFlag = v.getFirstChild()?.getFirstChild()?.getNextSibling()?.getNextSibling()?.getTextContent()?.trim()
                    boolean repeat = repeatFlag.equalsIgnoreCase("repeat")


                    String note = v.getFirstChild()?.getFirstChild()?.getNextSibling()?.getNextSibling()?.getNextSibling()?.getTextContent()?.trim();
                    if (note != null) {
                        response = v.getFirstChild().getFirstChild().getNextSibling().getNextSibling().getNextSibling()?.getNextSibling()?.getNextSibling()?.getTextContent()?.trim();
                    }
                    violationList.add(new ViolationRecord(code, desc, note, response, repeat))
                }
            }
            record.setField("violations", violationList)
        }

        return record
    }

    def buildFacilityRecord(url, HtmlPage page) {
        DataRecord record = new DataRecord(url, "facility")

        record.setField("facilityId", extractIdFromUrl(url))

        record.setField("name", page.getByXPath("//h2")?.get(0).getFirstChild()?.getTextContent()?.trim())
        def headingList = page.getByXPath("//B")
        if (headingList.size() > 0) {
            String addressString = headingList.get(0)?.getNextSibling()?.getNextSibling()?.getTextContent()
            if (addressString != null) {
                String[] fields = addressString.split(",")
                if (fields.length >= 2) {
                    record.setField("street", fields[0].trim())
                    record.setField("city", fields[1].trim())
                } else {
                    record.setField("street", addressString.trim())
                }
                def mapLink = page.getByXPath("//a[contains(@href,'maps.google')]").get(0).getAttribute("href")
                if (mapLink != null) {
                    record.setField("zip", mapLink.substring(mapLink.length() - 5))
                }
            }

        }
        record.setField("type", page.getByXPath("//tr//*[contains(.,'Facility Type')]")?.get(0).getNextSibling()?.getFirstChild().getTextContent()?.trim());
        record.setField("phone", page.getByXPath("//tr//*[contains(.,'Phone')]")?.get(0).getNextSibling()?.getFirstChild().getTextContent()?.trim());

        def inspectionList = page.getByXPath("//tr//*[contains(.,'critical')]")
        if (inspectionList != null) {
            def inspectionRecords = []
            for (int i = 0; i < inspectionList.size(); i++) {
                InspectionRecord rec = new InspectionRecord();
                rec.setId(extractIdFromUrl(inspectionList.get(i).getPreviousSibling().getPreviousSibling().getFirstChild().getNextSibling().getAttribute('href')))
                rec.setType(inspectionList.get(i).getPreviousSibling().getPreviousSibling().getTextContent()?.trim())
                try {
                    rec.setDate(SHORT_DATE_FMT.parse(inspectionList.get(i).getPreviousSibling().getTextContent().replaceAll("\\u00A0", "").trim()))
                } catch (Exception e) {
                    try {
                        rec.setDate(DATE_FMT.parse(inspectionList.get(i).getPreviousSibling().getTextContent().replaceAll("\\u00A0", "").trim()))
                    } catch (Exception e2) {
                        logger.warn("Could not parse inspection date", e2)
                    }
                }
                def violationString = inspectionList.get(i).getTextContent()
                if (violationString != null) {
                    String[] violationParts = violationString.replaceAll("\\u00A0", "").trim().split("&")
                    for (String part in violationParts) {
                        if (part.contains("non-critical")) {
                            rec.setNonCriticalViolations(Integer.parseInt(part.replace("non-critical", "").trim()));
                        } else {
                            rec.setCriticalViolations(Integer.parseInt(part.replace("critical", "").trim()));
                        }
                    }

                }
                inspectionRecords.add(rec);
            }
            record.setField("inspections", inspectionRecords);
        }

        return record
    }

    def extractIdFromUrl(url) {
        def id = null
        if (url?.contains(CATEGORY_PARAM)) {
            id = url.substring(url.indexOf(CATEGORY_PARAM) + CATEGORY_PARAM.length())
            if (id.contains("&")) {
                id = id.substring(0, id.indexOf("&"))
            }
        }
        return id
    }
}