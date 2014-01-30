package org.cataractsoftware.healthinspections.scraper;

import org.cataractsoftware.datasponge.DataSponge;

/**
 * @author Christopher Fagiani
 */
public class HealthInspectionScraper {

    public static void main(String[] args) {
        checkArgs(args);
        try {
            DataSponge sponge = new DataSponge(DataSponge.loadProps(args[0]));
            sponge.executeCrawl();
        } catch (Exception e) {
            System.err.println("Could not run sponge: " + e.getMessage());
            e.printStackTrace(System.err);
        }


    }

    private static void checkArgs(String[] args) {
        if (args == null || args.length != 1) {
            System.out.println("You must specify the path to the property file on the command line");
            System.exit(1);
        }

    }
}
