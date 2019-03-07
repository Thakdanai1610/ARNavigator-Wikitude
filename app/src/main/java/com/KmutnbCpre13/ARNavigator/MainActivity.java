package com.KmutnbCpre13.ARNavigator;

import com.wikitude.architect.ArchitectView;
import com.wikitude.architect.ArchitectJavaScriptInterfaceListener;
import com.wikitude.architect.ArchitectStartupConfiguration;

import com.KmutnbCpre13.ARNavigator.util.location.LocationProvider;
import com.wikitude.common.camera.CameraSettings;

import android.location.Location;
import android.location.LocationListener;
import android.os.Handler;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;

import org.json.JSONException;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Timer;
import java.util.TimerTask;

public class MainActivity extends AppCompatActivity implements ArchitectJavaScriptInterfaceListener {

    private ArchitectView architectView;
    private LocationProvider locationProvider;

    private String state = "home";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        architectView = (ArchitectView)this.findViewById( R.id.architectView );
        final ArchitectStartupConfiguration config = new ArchitectStartupConfiguration();
        config.setFeatures(ArchitectStartupConfiguration.Features.Geo);
        config.setCameraResolution(CameraSettings.CameraResolution.HD_1280x720);
        config.setLicenseKey("");

        architectView.onCreate( config );
        architectView.addArchitectJavaScriptInterfaceListener(this);

        locationProvider = new LocationProvider(this, new LocationListener() {
            @Override
            public void onLocationChanged(Location location) {
                if (location!=null && MainActivity.this.architectView != null ) {
                    // check if location has altitude at certain accuracy level & call right architect method (the one with altitude information)
                    if ( location.hasAltitude() && location.hasAccuracy() && location.getAccuracy()<7) {
                        MainActivity.this.architectView.setLocation( location.getLatitude(), location.getLongitude(), location.getAltitude(), location.getAccuracy() );
                    } else {
                        MainActivity.this.architectView.setLocation( location.getLatitude(), location.getLongitude(), location.hasAccuracy() ? location.getAccuracy() : 1000 );
                    }
                    //architectView.callJavascript("test('"+ location.getAccuracy() +"')");
                }
            }

            @Override public void onStatusChanged(String s, int i, Bundle bundle) {}
            @Override public void onProviderEnabled(String s) {}
            @Override public void onProviderDisabled(String s) {}


        });
    }

    @Override
    protected void onPostCreate(Bundle savedInstanceState) {
        super.onPostCreate(savedInstanceState);

        architectView.onPostCreate();
        try{
            this.architectView.load("file:///android_asset/ARNavigator/index.html");
        } catch (Exception e){

        }
    }

   /* private Timer timer;
    private TimerTask timerTask;
    private Handler handler = new Handler();

    //To stop timer
    private void stopTimer(){
        if(timer != null){
            timer.cancel();
            timer.purge();
        }
    }

    //To start timer
    private void startTimer(){
        timer = new Timer();
        timerTask = new TimerTask() {
            public void run() {
                handler.post(new Runnable() {
                    public void run(){
                        String timeStamp = new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss").format(new Date());
                        architectView.callJavascript("test('"+ timeStamp +"')");
                    }
                });
            }
        };
        timer.schedule(timerTask, 1000, 1000);
    }
*/
    @Override
    protected void onResume(){
        super.onResume();

        architectView.onResume();
        locationProvider.onResume();

    }

    @Override
    protected  void onDestroy(){
        super.onDestroy();
        architectView.removeArchitectJavaScriptInterfaceListener(this);
        architectView.onDestroy();

    }

    @Override
    protected void onPause(){
        super.onPause();

        architectView.onPause();
        locationProvider.onPause();

    }

    @Override
    public void onBackPressed() {
        if(this.state.equals("navigate")){
            architectView.callJavascript("stopNav()");
        }else {
            // if (!shouldAllowBack()) {
            //   doSomething();
            // } else {
            super.onBackPressed();
        }
    }

    public void onJSONObjectReceived(JSONObject jsonObject) {
        try {
        switch (jsonObject.getString("action")) {
            case "sendState":
                this.state = jsonObject.getString("state");
                break;
        }
        } catch (JSONException e) {

        }
    }
}
