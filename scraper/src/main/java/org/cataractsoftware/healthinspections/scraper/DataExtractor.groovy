import com.gargoylesoftware.htmlunit.html.HtmlPage
import org.cataractsoftware.datasponge.DataRecord
import org.cataractsoftware.healthinspections.scraper.ViolationRecord

class DataExtractor {

    private static final String CATEGORY_PARAM = "RestrictToCategory=";


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
        record.setField("date", page.getByXPath("//tr//*[contains(.,'Inspection date')]").get(0).getNextSibling()?.getFirstChild().getTextContent()?.trim());

        def violations = page.getByXPath("//table[@cellspacing='3']//tr")
        if (violations != null) {
            def violationList = []
            for (v in violations) {
                String fullText = v.getFirstChild()?.getFirstChild()?.getTextContent()

                if (fullText != null) {
                    String code = ""
                    String desc = ""
                    String note = null
                    String response = null
                    boolean repeat = false;
                    if (fullText.contains("/")) {
                        code = fullText.substring(0, fullText.indexOf("/")).trim()
                        desc = fullText.substring(fullText.indexOf("/") + 1).trim()
                    }
                    String repeatFlag = v.getFirstChild()?.getFirstChild()?.getNextSibling()?.getNextSibling()?.getTextContent()?.trim()
                    repeat = repeatFlag.equalsIgnoreCase("repeat")


                    note = v.getFirstChild()?.getFirstChild()?.getNextSibling()?.getNextSibling()?.getNextSibling()?.getTextContent()?.trim();
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
            }

        }
        record.setField("type", page.getByXPath("//tr//*[contains(.,'Facility Type')]")?.get(0).getNextSibling()?.getFirstChild().getTextContent()?.trim());
        record.setField("phone", page.getByXPath("//tr//*[contains(.,'Phone')]")?.get(0).getNextSibling()?.getFirstChild().getTextContent()?.trim());

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