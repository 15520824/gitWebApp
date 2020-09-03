package com.carddone;

import android.app.Notification;
import android.app.NotificationChannel;
import android.service.notification.StatusBarNotification;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class myBaseJavaModule extends ReactContextBaseJavaModule {


    myBaseJavaModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "myBaseJavaModule";
    }

    @ReactMethod
    void removeAllNotification()
    {
        MainActivity activity = (MainActivity)getCurrentActivity();
        activity.manager.cancelAll();
    }

    @ReactMethod
    void removeNotificationBySessionid()
    {
        MainActivity activity = (MainActivity)getCurrentActivity();
        StatusBarNotification[] NotificationChannel = new StatusBarNotification[0];
        int i, j, k, id;
        String s;
        Notification n;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            NotificationChannel = activity.manager.getActiveNotifications();
            for (k = 0; k < NotificationChannel.length; k++) {
                n = NotificationChannel[k].getNotification();
                s = n.extras.getCharSequence(Notification.EXTRA_TEXT).toString();
                Log.d("111111111", s);
                s = n.extras.getCharSequence(Notification.EXTRA_TITLE).toString();
                Log.d("222222222", s);
                s = n.extras.getCharSequence(Notification.EXTRA_INFO_TEXT).toString();
                Log.d("333333333", s);

            }
        }

    }
}
