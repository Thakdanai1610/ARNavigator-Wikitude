package com.cpre13.engARnavigator.util.wifi;

import com.cpre13.engARnavigator.ArActivity;
import com.cpre13.engARnavigator.util.wifi.WifiCal;
import com.google.gson.Gson;

import java.io.InputStream;
import java.nio.FloatBuffer;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.wifi.ScanResult;
import android.net.wifi.WifiManager;
import android.widget.SimpleAdapter;

public class WifiIPS {

    private static int wifiSize;
    public static WifiManager wifi;
    private static List<ScanResult> wifiData;
    private static IPS[] ipsData;
    private static Gson gson = new Gson();
    public static int currentFloor = 0;


    class IPS {
        String MAC;
        int floor;
        Double lat;
        Double lon;
    }

    public static void wifi_init(Context ct){

        callWifiJSON(ct);

        wifi = (WifiManager) ct.getApplicationContext().getSystemService(Context.WIFI_SERVICE);
        if (!wifi.isWifiEnabled())
        {
            wifi.setWifiEnabled(true);
        }

        ct.registerReceiver(new BroadcastReceiver()
        {
            @Override
            public void onReceive(Context c, Intent intent)
            {
                wifiData = wifi.getScanResults();
                wifiSize = wifiData.size();
            }
        }, new IntentFilter(WifiManager.SCAN_RESULTS_AVAILABLE_ACTION));
    }

    static void callWifiJSON(Context ct){
        try {
            InputStream input = ct.getAssets().open("ARNavigator/json/wifi_data.json");
            int size11 = input.available();
            byte[] buffer = new byte[size11];
            input.read(buffer);
            input.close();
            String text = new String(buffer);

            ipsData = gson.fromJson(text, WifiIPS.IPS[].class);
        }catch (Exception e){

        }
    }


    private static double[] getGeo(IPS[] ipsIn, String macAddr){
        for (IPS ips : ipsIn) {
            if (ips.MAC.equals(macAddr)) {
                return new double[]{ips.lat, ips.lon};
            }
        }
        return null;
    }


    private static boolean checkMAC(IPS[] ipsIn, String macAddr){
        for (IPS ips : ipsIn) {
            if (ips.MAC.equals(macAddr)) {
                return true;
            }
        }
        return false;
    }

    private static int getFloor (IPS[] ipsIn, String macAddr){
        for (IPS ips : ipsIn) {
            if (ips.MAC.equals(macAddr)) {
                return ips.floor;
            }
        }
        return 0;
    }

    public static double[] ipsPoint(){
        HashMap<String, String> item;
        String ITEM_KEY = "key";

        double[] result = new double[2];


        List<String> mac = new ArrayList<>();
        List<Double> dist = new ArrayList<>();
        List<Integer> floor = new ArrayList<>();

        //int currentFloor = 0;


        int wifiIndex = wifiSize - 1;
        while (wifiIndex >= 0) {
            //if(Arrays.asList(wifiname).contains(wifiData.get(size).SSID) && (wifiData.get(size).frequency < 3000)) {
            if((wifiData.get(wifiIndex).frequency < 3000)) {
                double distance = Math.pow(10.0, (27.55 - (20 * Math.log10(wifiData.get(wifiIndex).frequency)) + Math.abs(wifiData.get(wifiIndex).level)) / 20.0);
                if(checkMAC(ipsData,wifiData.get(wifiIndex).BSSID) && distance < 100) {
                    /*item = new HashMap<String, String>();
                    item.put(ITEM_KEY,"Floor : "+ getFloor(ipsData, wifiData.get(wifiIndex).BSSID) + "\n" + wifiData.get(wifiIndex).SSID + "\n" + wifiData.get(wifiIndex).BSSID + "\nDistance : " + distance);
                    MainActivity.arraylist.add(item);
                    MainActivity.adapter.notifyDataSetChanged();*/

                    floor.add(getFloor(ipsData, wifiData.get(wifiIndex).BSSID));
                    mac.add(wifiData.get(wifiIndex).BSSID);
                    dist.add(distance / 1000);
                }
            }


            wifiIndex--;
            //MainActivity.adapter.notifyDataSetChanged();

        }

        //ArActivity.console("pass1 " + " " + wifiSize +  " " +  wifiIndex);
        if(mac.size() >= 3) {

        for (int n = 0; n < dist.size(); n++) {
            for (int m = 0; m < dist.size()-1 - n; m++) {
                if ((Double.compare(dist.get(m),dist.get(m + 1))) > 0) {
                    double swapDist = dist.get(m);
                    dist.set(m,dist.get(m + 1));
                    dist.set(m + 1,swapDist);
                    String swapMac = mac.get(m);
                    mac.set(m,mac.get(m + 1));
                    mac.set(m + 1,swapMac);
                    int swapFloor = floor.get(m);
                    floor.set(m,floor.get(m + 1));
                    floor.set(m + 1,swapFloor);
                }
            }
        }



            currentFloor = WifiCal.modeFloor(new int[] {floor.get(0),floor.get(1),floor.get(2)});

            List<List<String>> macSet = new ArrayList<List<String>>();
            List<List<Double>> distSet = new ArrayList<List<Double>>();
            for(int i = 0; i < mac.size() - 2;i++){

                String Mfirst = mac.get(i);
                double Dfirst = dist.get(i) - (Math.abs(floor.get(i) - currentFloor) * 10);
                for(int j = i+1;j < mac.size();j++){
                    String Msecond = mac.get(j);
                    double Dsecond = dist.get(j) - (Math.abs(floor.get(j) - currentFloor) * 10);

                    for(int k = j+1;k < mac.size();k++){
                        String Mthird = mac.get(k);
                        double Dthird = dist.get(k)  - (Math.abs(floor.get(k) - currentFloor) * 10);
                        //System.out.println(k + " : " + (inputs.length - (1+j)));
                        //System.out.println(first + " " + second + " " + third);

                        List<Double> Dsubset = new ArrayList<>();
                        Dsubset.add(Dfirst);
                        Dsubset.add(Dsecond);
                        Dsubset.add(Dthird);

                        distSet.add(Dsubset);

                        List<String> Msubset = new ArrayList<>();
                        Msubset.add(Mfirst);
                        Msubset.add(Msecond);
                        Msubset.add(Mthird);

                        macSet.add(Msubset);
                    }
                }
            }



            //int index_mean = 0;
            List<double[]> result_all = new ArrayList<>();
            for(int i = 0;i < macSet.size();i++) {
                double[] wifi1 = getGeo(ipsData, macSet.get(i).get(0));
                double[] wifi2 = getGeo(ipsData, macSet.get(i).get(1));
                double[] wifi3 = getGeo(ipsData, macSet.get(i).get(2));

                result = WifiCal.calPoint(wifi1, distSet.get(i).get(0), wifi2, distSet.get(i).get(1), wifi3, distSet.get(i).get(2));
                if(!Double.isNaN(result[0])){
                    result_all.add(result);
                    /*item = new HashMap<String, String>();
                    item.put(ITEM_KEY, macSet.get(i).get(0)+" (" + distSet.get(i).get(0) +
                            ")\n"+macSet.get(i).get(1)+" (" + distSet.get(i).get(1) +
                            ")\n"+macSet.get(i).get(2)+" (" + distSet.get(i).get(2) +
                            ")\n\n" + "Your Place...!!!!!!\n    Latitute : " + result[0] + "\n    Longitute : " + result[1]);
                    MainActivity.arraylist.add(item);
                    MainActivity.adapter.notifyDataSetChanged();
                    *///break;
                                        /*lat_mean += result[0];
                                        lon_mean += result[1];
                                        index_mean++;*/
                }
            }


            if(result_all.size() != 0) {
                return WifiCal.medianIPS(result_all);
            }else{
                return  new double[] {0,0};
            }
                                /*if(index_mean != 0) {
                                    lat_mean /= index_mean;
                                    lon_mean /= index_mean;
                                }*/

            //return result;
            /*item = new HashMap<String, String>();
            item.put(ITEM_KEY, "Your Place...!!!!!!\n    Latitute : " + result[0] + "\n    Longitute : " + result[1]);
            MainActivity.arraylist.add(item);
            MainActivity.adapter.notifyDataSetChanged();*/
        }else{
            return  new double[] {0,0};
            /*item = new HashMap<String, String>();
            item.put(ITEM_KEY, "wifi ไม่พออ่ะคร้าบ");
            MainActivity.arraylist.add(item);
            MainActivity.adapter.notifyDataSetChanged();*/
        }
    }
}
