package com.cpre13.engARnavigator.util.wifi;

import java.util.Arrays;
import java.util.List;

public class WifiCal {

    static double[] calPoint(double[] wifi1, double DistA, double[] wifi2, double DistB, double[] wifi3, double DistC){
        double earthR = 6371;
        double LatA = wifi1[0];
        double LonA =  wifi1[1];

        double LatB = wifi2[0];
        double LonB = wifi2[1];

        double LatC = wifi3[0];
        double LonC = wifi3[1];

        //using authalic sphere
        //if using an ellipsoid this step is slightly different
        //Convert geodetic Lat/Long to ECEF xyz
        //   1. Convert Lat/Long to toRadians
        //   2. Convert Lat/Long(toRadians) to ECEF
        double xA = earthR *(Math.cos(Math.toRadians(LatA)) * Math.cos(Math.toRadians(LonA)));
        double yA = earthR *(Math.cos(Math.toRadians(LatA)) * Math.sin(Math.toRadians(LonA)));
        double zA = earthR *(Math.sin(Math.toRadians(LatA)));

        double xB = earthR *(Math.cos(Math.toRadians(LatB)) * Math.cos(Math.toRadians(LonB)));
        double yB = earthR *(Math.cos(Math.toRadians(LatB)) * Math.sin(Math.toRadians(LonB)));
        double zB = earthR *(Math.sin(Math.toRadians(LatB)));

        double xC = earthR *(Math.cos(Math.toRadians(LatC)) * Math.cos(Math.toRadians(LonC)));
        double yC = earthR *(Math.cos(Math.toRadians(LatC)) * Math.sin(Math.toRadians(LonC)));
        double zC = earthR *(Math.sin(Math.toRadians(LatC)));

        double[] P1 = {xA, yA, zA};
        double[] P2 = {xB, yB, zB};
        double[] P3 = {xC, yC, zC};


        double[] subP21 =  subArr(P2, P1);
        double[] subP31 =  subArr(P3, P1);


        double[] ex = divideArrayByDouble(subP21,Vnorm(subP21));

        double i = dot(ex, subP31);
        double[] ey = divideArrayByDouble((subArr(subP31,multiply(ex, i))),Vnorm(subArr(subP31,multiply(ex, i))));
        double[] ez = cross(ex,ey);
        double d = Vnorm(subP21);
        double j = dot(ey, subP31);

        double x = (Math.pow(DistA,2) - Math.pow(DistB,2) + Math.pow(d,2))/(2*d);
        double y = ((Math.pow(DistA,2) - Math.pow(DistC,2) + Math.pow(i,2) + Math.pow(j,2))/(2*j)) - ((i/j)*x);

        double z = Math.sqrt(Math.pow(DistA,2) - Math.pow(x,2) - Math.pow(y,2));

        double[] triPt = new double[3];
        triPt[0] = P1[0] + multiply(ex,x)[0] + multiply(ey,y)[0] + multiply(ez,z)[0];
        triPt[1] = P1[1] + multiply(ex,x)[1] + multiply(ey,y)[1] + multiply(ez,z)[1];
        triPt[2] = P1[2] + multiply(ex,x)[2] + multiply(ey,y)[2] + multiply(ez,z)[2];

        //convert back to lat/long from ECEF
        //convert to degrees
        double lat = Math.toDegrees(Math.asin(triPt[2] / earthR));
        double lon = Math.toDegrees(Math.atan2(triPt[1],triPt[0]));
        return new double[] {lat,lon};

    }

    public static double fd(double lat1, double lon1, double lat2, double lon2){  // generally used geo measurement function
        double R = 6378.137; // Radius of earth in KM
        double dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
        double dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
        double a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        double d = R * c;
        return d * 1000; // meters
    }
    public static double[] subArr(double[] a, double[] b){
        double[] result = new double[3];
        for(int i = 0;i < a.length;i++){
            result[i] = a[i] - b[i];
        }
        return result;
    }

    public static double[] divideArrayByDouble(double[] a, double b){
        double[] result = new double[3];
        for(int i = 0;i < a.length;i++){
            result[i] = a[i] / b;
        }
        return result;
    }

    public static double Vnorm(double[] a){
        double result = 0;
        for(int i = 0;i < a.length;i++){
            result += Math.pow(a[i],2);
        }
        return Math.pow(result, 0.5);
    }

    public static double dot(double[] a, double[] b) {
        double sum = 0;
        for (int i = 0; i < a.length; i++) {
            sum += a[i] * b[i];
        }
        return sum;
    }

    public static double[] multiply(double[] a, double b) {
        double[] result = new double[3];
        for (int i = 0; i < a.length; i++) {
            result[i] = a[i] * b;
        }
        return result;
    }

    public static double[] cross(double[] a, double[] b){
        double[] result = { (a[1]*b[2]) - (a[2]*b[1]),
                (a[2]*b[0]) - (a[0]*b[2]),
                (a[0]*b[1]) - (a[1]*b[0]) };
        return result;
    }

    public static double[] medianIPS(List<double[]> allIPS) {
        double[] lat = new double[allIPS.size()];
        double[] lon = new double[allIPS.size()];

        for (int i = 0; i < allIPS.size(); i++) {
            lat[i] = allIPS.get(i)[0];
            lon[i] = allIPS.get(i)[1];
        }

        Arrays.sort(lat);
        Arrays.sort(lon);
        double lat_median;
        double lon_median;
        if (allIPS.size() % 2 == 0) {
            lat_median = (lat[allIPS.size() / 2] + lat[allIPS.size() / 2]) / 2;
            lon_median = (lon[allIPS.size() / 2] + lon[allIPS.size() / 2]) / 2;
        } else {
            lat_median = lat[allIPS.size() / 2];
            lon_median = lon[allIPS.size() / 2];
        }

        return new double[] {lat_median,lon_median};
    }

    public static int modeFloor(int a[]) {
        int maxValue = 0;
        int maxCount = 0;

        for (int i = 0; i < a.length; ++i) {
            int count = 0;
            for (int j = 0; j < a.length; ++j) {
                if (a[j] == a[i]) ++count;
            }
            if (count > maxCount) {
                maxCount = count;
                maxValue = a[i];
            }
        }

        return maxValue;
    }

}
