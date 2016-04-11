package com.wikitude.samples;

import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.graphics.drawable.BitmapDrawable;
import android.hardware.GeomagneticField;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.location.Location;
import android.os.Bundle;
import android.app.Activity;
import android.util.DisplayMetrics;
import android.util.Log;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import com.wikitude.sdksamples.R;

public class RotateActivity extends Activity {

    private static SensorManager sensorService;
    private Sensor sensor;
    double source_lat;
    double source_long;
    String destination_lat;
    String destination_lon;
    Bundle locationUpdates;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_rotate);

        locationUpdates = getIntent().getExtras();

        if(locationUpdates != null){

            source_lat = locationUpdates.getDouble("source_latitude");
            source_long = locationUpdates.getDouble("source_longitude");
            destination_lat = locationUpdates.getString("destination_latitude");
            destination_lon = locationUpdates.getString("destination_longitude");

        }
        sensorService = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        sensor = sensorService.getDefaultSensor(Sensor.TYPE_ORIENTATION);
        if (sensor != null) {
            sensorService.registerListener(mySensorEventListener, sensor,
                    SensorManager.SENSOR_DELAY_NORMAL);
            Log.i("Compass MainActivity", "Registerered for ORIENTATION Sensor");
        } else {
            Log.e("Compass MainActivity", "Registerered for ORIENTATION Sensor");
            Toast.makeText(this, "ORIENTATION Sensor not found",
                    Toast.LENGTH_LONG).show();
            finish();
        }
    }

    private SensorEventListener mySensorEventListener = new SensorEventListener() {

        @Override
        public void onSensorChanged(SensorEvent event) {
            Location LocationObj = new Location("");//provider name is unecessary
            LocationObj.setLatitude(source_lat);//your coords of course
            LocationObj.setLongitude(source_long);

            Location destinationObj = new Location("");//provider name is unecessary
            destinationObj.setLatitude(Double.parseDouble(destination_lat));//your coords of course
            destinationObj.setLongitude(Double.parseDouble(destination_lon));

            float distanceInMeters =  destinationObj.distanceTo(LocationObj);
            System.out.println("distanceInMeters: "+ distanceInMeters);

            ImageView arrow = (ImageView)findViewById(R.id.arrow);
            TextView tx_fieldBearing = (TextView)findViewById(R.id.tv_fieldBearing);

            // If we don't have a Location, we break out
            if ( LocationObj == null ) return;

            float azimuth = event.values[0];
            float baseAzimuth = azimuth;

            GeomagneticField geoField = new GeomagneticField( Double
                    .valueOf(LocationObj.getLatitude()).floatValue(), Double
                    .valueOf(LocationObj.getLongitude()).floatValue(),
                    Double.valueOf( LocationObj.getAltitude() ).floatValue(),
                    System.currentTimeMillis() );

            azimuth -= geoField.getDeclination(); // converts magnetic north into true north

            // Store the bearingTo in the bearTo variable
            float bearTo = LocationObj.bearingTo( destinationObj );

            // If the bearTo is smaller than 0, add 360 to get the rotation clockwise.
            if (bearTo < 0) {
                bearTo = bearTo + 360;
            }

            //This is where we choose to point it
            float direction = bearTo - azimuth;

            // If the direction is smaller than 0, add 360 to get the rotation clockwise.
            if (direction < 0) {
                direction = direction + 360;
            }

            rotateImageView( arrow, R.drawable.arrow_east, direction );

            //Set the field
            String bearingText = "N";

            if ( (360 >= baseAzimuth && baseAzimuth >= 337.5) || (0 <= baseAzimuth && baseAzimuth <= 22.5) ) bearingText = "N";
            else if (baseAzimuth > 22.5 && baseAzimuth < 67.5) bearingText = "NE";
            else if (baseAzimuth >= 67.5 && baseAzimuth <= 112.5) bearingText = "E";
            else if (baseAzimuth > 112.5 && baseAzimuth < 157.5) bearingText = "SE";
            else if (baseAzimuth >= 157.5 && baseAzimuth <= 202.5) bearingText = "S";
            else if (baseAzimuth > 202.5 && baseAzimuth < 247.5) bearingText = "SW";
            else if (baseAzimuth >= 247.5 && baseAzimuth <= 292.5) bearingText = "W";
            else if (baseAzimuth > 292.5 && baseAzimuth < 337.5) bearingText = "NW";
            else bearingText = "?";

            tx_fieldBearing.setText(bearingText);
        }

        @Override
        public void onAccuracyChanged(Sensor sensor, int accuracy) {

        }
    };


    private void rotateImageView( ImageView imageView, int drawable, float rotate ) {

        // Decode the drawable into a bitmap
        Bitmap bitmapOrg = BitmapFactory.decodeResource(getResources(),
                drawable);

        // Get the width/height of the drawable
        DisplayMetrics dm = new DisplayMetrics(); getWindowManager().getDefaultDisplay().getMetrics(dm);
        int width = bitmapOrg.getWidth(), height = bitmapOrg.getHeight();
        System.out.println("width: " + width + " height: " + height);

        // Initialize a new Matrix
        Matrix matrix = new Matrix();

        // Decide on how much to rotate
        rotate = rotate % 360;

        // Actually rotate the image
        matrix.postRotate( rotate, width, height );

        // recreate the new Bitmap via a couple conditions
        Bitmap rotatedBitmap = Bitmap.createBitmap(bitmapOrg, 0, 0, width, height, matrix, true);
        //BitmapDrawable bmd = new BitmapDrawable( rotatedBitmap );

        //imageView.setImageBitmap( rotatedBitmap );
        imageView.setImageDrawable(new BitmapDrawable(getResources(), rotatedBitmap));
        imageView.setScaleType( ImageView.ScaleType.CENTER );
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (sensor != null) {
            sensorService.unregisterListener(mySensorEventListener);
        }
    }

}
