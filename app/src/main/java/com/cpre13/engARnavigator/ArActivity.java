package com.cpre13.engARnavigator;

import com.cpre13.engARnavigator.util.wifi.WifiCal;
import com.cpre13.engARnavigator.util.wifi.WifiIPS;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.IntentSender;
import android.content.pm.PackageManager;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorListener;
import android.hardware.SensorManager;
import android.location.Location;
import android.location.LocationListener;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;

import com.cpre13.engARnavigator.util.location.LocationProvider;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.PendingResult;
import com.google.android.gms.common.api.ResultCallback;
import com.google.android.gms.common.api.Status;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.LocationSettingsRequest;
import com.google.android.gms.location.LocationSettingsResult;
import com.google.android.gms.location.LocationSettingsStatusCodes;
import com.wikitude.architect.ArchitectJavaScriptInterfaceListener;
import com.wikitude.architect.ArchitectStartupConfiguration;
import com.wikitude.architect.ArchitectView;
import com.wikitude.common.camera.CameraSettings;
import com.wikitude.common.permission.PermissionManager;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;

public class ArActivity extends AppCompatActivity implements ArchitectJavaScriptInterfaceListener {

    protected static final int REQUEST_CHECK_SETTINGS = 0x1;
    ArchitectView architectView;
    private LocationProvider locationProvider;

    private String state = "home";

    boolean useIPS = false;

    private double lat_target = 0;
    private double lon_target = 0;

    Timer t;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        WifiIPS.wifi_init(this);

        architectView = (ArchitectView) this.findViewById(R.id.architectView);
        final ArchitectStartupConfiguration config = new ArchitectStartupConfiguration();
        config.setFeatures(ArchitectStartupConfiguration.Features.Geo);
        config.setCameraResolution(CameraSettings.CameraResolution.FULL_HD_1920x1080);
        config.setLicenseKey("");

        architectView.onCreate(config);
        architectView.addArchitectJavaScriptInterfaceListener(this);

        displayLocationSettingsRequest(this);
        locationProvider = new LocationProvider(this, new LocationListener() {
            @Override
            public void onLocationChanged(Location location) {
                if (location != null && ArActivity.this.architectView != null) {
                    // check if location has altitude at certain accuracy level & call right architect method (the one with altitude information)
                    if (inside(location.getLatitude(), location.getLongitude())) {
                        architectView.callJavascript("inside_area()");

                        if (Build.VERSION.SDK_INT >= 28) {
                            ArActivity.this.architectView.setLocation(location.getLatitude(), location.getLongitude(), location.getAltitude(), location.getAccuracy());
                        } else {
                            if (location.hasAltitude() && location.hasAccuracy() && location.getAccuracy() <= 20) {
                                if (useIPS) {
                                    t.cancel();
                                }
                                useIPS = false;
                                architectView.callJavascript("changeNavStatus('GPS')");
                                ArActivity.this.architectView.setLocation(location.getLatitude(), location.getLongitude(), location.getAltitude(), location.getAccuracy());
                            } else {
                                if (!useIPS) {
                                    useIPS = true;
                                    t = startTimer(location);
                                }

                            }
                        }
                        architectView.callJavascript("getAccuracy('" + Math.round(location.getAccuracy()) + "')");
                    } else {
                        architectView.callJavascript("outside_area()");
                    }
                }

            }

            @Override
            public void onStatusChanged(String s, int i, Bundle bundle) {
            }

            @Override
            public void onProviderEnabled(String s) {
            }

            @Override
            public void onProviderDisabled(String s) {
            }


        });

    }


    @Override
    protected void onPostCreate(Bundle savedInstanceState) {
        super.onPostCreate(savedInstanceState);

        architectView.onPostCreate();
        try {
            this.architectView.load("file:///android_asset/ARNavigator/index.html");
        } catch (Exception e) {

        }
    }

    private void displayLocationSettingsRequest(Context context) {
        GoogleApiClient googleApiClient = new GoogleApiClient.Builder(context)
                .addApi(LocationServices.API).build();
        googleApiClient.connect();

        LocationRequest locationRequest = LocationRequest.create();
        locationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);
        locationRequest.setInterval(10000);
        locationRequest.setFastestInterval(10000 / 2);

        LocationSettingsRequest.Builder builder = new LocationSettingsRequest.Builder().addLocationRequest(locationRequest);
        builder.setAlwaysShow(true);

        PendingResult<LocationSettingsResult> result = LocationServices.SettingsApi.checkLocationSettings(googleApiClient, builder.build());

        result.setResultCallback(new ResultCallback<LocationSettingsResult>() {
            @Override
            public void onResult(LocationSettingsResult result) {
                final Status status = result.getStatus();
                switch (status.getStatusCode()) {
                    case LocationSettingsStatusCodes.SUCCESS:

                        break;

                    case LocationSettingsStatusCodes.RESOLUTION_REQUIRED:

                        try {
                            // Show the dialog by calling startResolutionForResult(), and check the result

                            status.startResolutionForResult(ArActivity.this, REQUEST_CHECK_SETTINGS);
                        } catch (IntentSender.SendIntentException e) {

                        }
                        break;
                    case LocationSettingsStatusCodes.SETTINGS_CHANGE_UNAVAILABLE:

                        break;
                }
            }
        });
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data)
    {
        //final LocationSettingsStates states = LocationSettingsStates.fromIntent(data);
        switch (requestCode)
        {
            case REQUEST_CHECK_SETTINGS:
                switch (resultCode)
                {
                    case Activity.RESULT_OK:
                    {
                        // All required changes were successfully made
                        break;
                    }
                    case Activity.RESULT_CANCELED:
                    {
                        // The user was asked to change settings, but chose not to
                        finishAffinity();
                        break;
                    }
                    default:
                    {
                        break;
                    }
                }
                break;
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        architectView.onResume();
        locationProvider.onResume();

    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        architectView.removeArchitectJavaScriptInterfaceListener(this);
        architectView.onDestroy();

    }

    @Override
    protected void onPause() {
        super.onPause();

        architectView.onPause();
        locationProvider.onPause();

    }

    @Override
    public void onBackPressed() {
        switch (this.state) {
            case "navigate":
                architectView.callJavascript("stopNav()");
                break;
            case "seePlace":
                architectView.callJavascript("closePlace()");
                break;
            case "selectFloor":
                architectView.callJavascript("closeFloorPopup()");
                break;
            default:
                finishAffinity();
                break;
        }
    }

    public String getMacId() {

        WifiManager wifiManager = (WifiManager) getApplicationContext().getSystemService(Context.WIFI_SERVICE);
        WifiInfo wifiInfo = wifiManager.getConnectionInfo();
        return wifiInfo.getBSSID();
    }

    public void onJSONObjectReceived(JSONObject jsonObject) {
        try {
            switch (jsonObject.getString("action")) {
                case "sendState":
                    this.state = jsonObject.getString("state");
                    break;
                case "fakeGPS":
                    Location loc = new Location("");
                    ArActivity.this.architectView.setLocation(jsonObject.getDouble("lat"), jsonObject.getDouble("long"), 0);
                    break;
                case "waitGPS":
                    architectView.callJavascript("startNav()");
                    break;
                case "setTarget":
                    this.lat_target = jsonObject.getDouble("lat");
                    this.lon_target = jsonObject.getDouble("lon");
                    break;


            }
        } catch (JSONException e) {

        }
    }

    public static boolean inside(double lat, double lon) {
        double[] point = {lat, lon};
        double[][] polygon = {{13.82028419, 100.51433444}, {13.821824, 100.51647055}, {13.82221885, 100.51502752}, {13.82184796, 100.51467025}, {13.82247826, 100.51339459}, {13.8228929, 100.51375294}, {13.82307834, 100.51327872}, {13.82272829, 100.51307166}, {13.8229502, 100.51261032}, {13.82354716, 100.51293969}, {13.82407535, 100.51252019}, {13.82366488, 100.51192474}, {13.8234336, 100.51195586}, {13.82290749, 100.51129282}, {13.82170627, 100.51224124}};


        double x = point[0];
        double y = point[1];

        boolean inside = false;
        int j = polygon.length - 1;
        for (int i = 0; i < polygon.length; j = i++) {
            double xi = polygon[i][0], yi = polygon[i][1];
            double xj = polygon[j][0], yj = polygon[j][1];

            boolean intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) {
                inside = !inside;
            }
        }

        return inside;
    }

    List<double[]> wifi_buffer = new ArrayList<>();
    int buffer_size = 0;
    int fail_count = 0;

    boolean rmedian = false;
    double[] result_median;

    Timer startTimer(Location location) {
        Timer timer = new Timer();
        timer.schedule(new TimerTask() {
            public void run() {
                WifiIPS.wifi.startScan();

                try {

                    double[] result = WifiIPS.ipsPoint();

                    if(buffer_size == 6){
                        buffer_size = 0;
                        if(wifi_buffer.size() != 0) {
                            rmedian = true;
                            result_median = WifiCal.medianIPS(wifi_buffer);
                            wifi_buffer = new ArrayList<>();
                        }
                    }else{
                        buffer_size++;
                        if(result[0] != 0){
                            wifi_buffer.add(result);
                        }
                    }

                    if(rmedian && WifiCal.fd(lat_target,lon_target,result_median[0],result_median[1]) < 100){
                        fail_count = 0;

                        architectView.callJavascript("changeNavStatus('IPS')");
                        ArActivity.this.architectView.setLocation(result_median[0], result_median[1], 0);

                    }else{
                        if (fail_count > 5000) {
                            architectView.callJavascript("changeNavStatus('GPS')");
                            ArActivity.this.architectView.setLocation(location.getLatitude(), location.getLongitude(), location.hasAccuracy() ? location.getAccuracy() : 1000);
                        } else {
                            fail_count += 500;
                        }
                    }

                } catch (Exception e) {
                }
            }
        }, 0, 500);
        return timer;
    }

}