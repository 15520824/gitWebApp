package com.carddone;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;

import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
   public NotificationManager manager;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      NotificationChannel notificationChannel = new NotificationChannel("reminder19001080", "reminder19001080", NotificationManager.IMPORTANCE_HIGH);
      notificationChannel.setShowBadge(true);
      notificationChannel.setDescription("Test Notifications");
      notificationChannel.enableVibration(true);
      notificationChannel.enableLights(true);
      notificationChannel.setVibrationPattern(new long[]{400, 200, 400});
      //notificationChannel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
      manager = getSystemService(NotificationManager.class);
      manager.createNotificationChannel(notificationChannel);
    }
    checkPermission();
  }
  @Override
  protected String getMainComponentName() {
    return "CardDone";
  }

  public void checkPermission() {
    if (Build.VERSION.SDK_INT >= 23) {
      if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED && checkSelfPermission(android.Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) {


      } else {
        ActivityCompat.requestPermissions(this, new String[]{
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION,}, 1);
      }
    }
  }

  @Override
  public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
    if (requestCode == 1 && grantResults[0] == PackageManager.PERMISSION_GRANTED && grantResults[1] == PackageManager.PERMISSION_GRANTED) {


    } else {
      checkPermission();
    }
  }
}
