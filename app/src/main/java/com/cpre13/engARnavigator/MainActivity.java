package com.cpre13.engARnavigator;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.support.annotation.NonNull;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.widget.Toast;

import com.wikitude.architect.ArchitectView;
import com.wikitude.common.permission.PermissionManager;

import java.util.Arrays;

public class MainActivity extends AppCompatActivity {

    PermissionManager pm;
    private Context context;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        pm = ArchitectView.getPermissionManager();
        context = this;
        final String[] permissions = new String[]{Manifest.permission.CAMERA, Manifest.permission.ACCESS_FINE_LOCATION};
                pm.checkPermissions(MainActivity.this, permissions, PermissionManager.WIKITUDE_PERMISSION_REQUEST, new PermissionManager.PermissionManagerCallback() {
                    @Override
                    public void permissionsGranted(int i) {
                        Intent intent = new Intent(context, ArActivity.class);
                        context.startActivity(intent);
                    }

                    @Override
                    public void permissionsDenied(@NonNull String[] strings) {
                        Toast.makeText(MainActivity.this, "The Wikitude SDK needs the following permissions to enable an AR experience: " +
                                Arrays.toString(strings), Toast.LENGTH_SHORT).show();
                    }

                    @Override
                    public void showPermissionRationale(final int i, @NonNull String[] strings) {
                        pm.positiveRationaleResult(i, permissions);
                    }
                });
    }


    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        pm.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }
}