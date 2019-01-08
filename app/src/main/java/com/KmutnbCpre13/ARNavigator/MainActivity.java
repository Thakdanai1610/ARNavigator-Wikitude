package com.KmutnbCpre13.ARNavigator;

import com.wikitude.architect.ArchitectView;
import com.wikitude.architect.ArchitectStartupConfiguration;

import com.KmutnbCpre13.ARNavigator.util.location.LocationProvider;
import com.wikitude.common.camera.CameraSettings;

import android.location.Location;
import android.location.LocationListener;
//import android.location.LocationProvider;
import android.os.Handler;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Timer;
import java.util.TimerTask;

public class MainActivity extends AppCompatActivity {

    private ArchitectView architectView;
    private LocationProvider locationProvider;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        architectView = (ArchitectView)this.findViewById( R.id.architectView );
        final ArchitectStartupConfiguration config = new ArchitectStartupConfiguration();
        config.setFeatures(ArchitectStartupConfiguration.Features.Geo);
        config.setCameraResolution(CameraSettings.CameraResolution.FULL_HD_1920x1080);
        config.setLicenseKey("I6R/USXoUhL7IovrxaWpZCxgmGtnWT+bX+bC/+XNbfAqtxB0F6B8suahhcgRJIfspYmnjc/xCQX6AAqA7n8XY6YHUcnUIwRHpARCL3n8xr1pXiTtXybQ+8xZY4tRZFTC3uysjoFLbNybZhT3jD7tAbmBJ4lEpiO8rfYyZfGcILpTYWx0ZWRfXxqh4SmU8zqBHV4k1NfhueiRvgRiJeKj3Iw7Bdli95h+Xqx/+qHRhLdm9uDPaE0loRF/FzQ/LNS64Njy06dw7p9kWDMDj5qm+aD424Y2yLNsLGbPCqSoreWr8xDMenGZ94e9ookTj8DE8JtYxGC4BYg7MWaxuqUXd/yMtpnoscHr+JMnK1hSltnc9QqRaxnFTFEZ+8BWfk/TA1vw3CpNK2U+PzVCyXtZP+zV1CKt+UI9BCHiXbDv9B+/qce4AGXHgPDEhw0PyXo3Az9H8MfnGM/RGC+S8BR7wHJA4sb9k8xFybORvAqCOW4FGYpgx1980/iBKzekPzOhpsJQ4LQnEvEffTvXEe/rGZ1rx4B6WtQSpjuIxf8DLrWZEN/aEMQ07J4wt90H5PAewz/pzxtBmm4RZNwetZI3oC5Cg17w1E/nyvAv7DBNLXEEfpzZauPdZPWdWFeMX71RCcsj14lAR+aW3iaWfzePN+tNh8VrFPrzu57uG2IfZwqblXuHSugKWIm9H68Hh3xvLF96KipW1AqKwsMGurbMj3QB5svkS6KdzoaEnKShVuQ9BlSfI0yTl0NlfOVW0trP\n");

        architectView.onCreate( config );

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
            this.architectView.load("file:///android_asset/demo1/index.html");
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

        architectView.onDestroy();
    }

    @Override
    protected void onPause(){
        super.onPause();

        architectView.onPause();
        locationProvider.onPause();

    }
}
