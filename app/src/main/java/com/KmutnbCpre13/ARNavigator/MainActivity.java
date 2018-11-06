package com.KmutnbCpre13.ARNavigator;

import com.wikitude.architect.ArchitectView;
import com.wikitude.architect.ArchitectStartupConfiguration;

import com.KmutnbCpre13.ARNavigator.util.location.LocationProvider;
import android.location.Location;
import android.location.LocationListener;
//import android.location.LocationProvider;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;

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
        config.setLicenseKey("");

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
