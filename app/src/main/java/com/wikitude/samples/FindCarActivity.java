package com.wikitude.samples;

import android.app.Activity;
import android.content.Intent;
import android.location.Location;
import android.os.Bundle;
import android.view.View;
import android.widget.ImageButton;
import android.widget.TextView;

import com.wikitude.samples.adapters.Constants;
import com.wikitude.samples.adapters.Database;
import com.wikitude.sdksamples.R;

public class FindCarActivity extends Activity{

    Database db = new Database(this);
    Location location;
    String latitude;
    String longitude;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_find_car);

        final TextView tv_location = (TextView) findViewById(R.id.tv_location);
        final TextView tv_userLocation = (TextView) findViewById(R.id.tv_userLocation);
        ImageButton btn_car_destination = (ImageButton) findViewById(R.id.btn_car_destination);
        ImageButton btn_find_car = (ImageButton) findViewById(R.id.btn_findCar);


        btn_car_destination.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                location = Constants.location;
                latitude = location.getLatitude()+"";
                longitude = location.getLongitude()+"";
                db.modifyAddress(latitude,longitude);

                tv_location.setText(latitude+ "," +longitude);
            }
        });

        btn_find_car.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                Location current_location = Constants.location;

                tv_userLocation.setText(current_location.getLatitude()+" , "+ current_location.getLongitude());

                String destination = db.getDestination(1);
                Intent intent = new Intent(getApplicationContext(), RotateActivity.class);

                intent.putExtra("source_latitude",current_location.getLatitude() );
                intent.putExtra("source_longitude",current_location.getLongitude() );

                intent.putExtra("destination_latitude",destination.split(",")[0] );
                intent.putExtra("destination_longitude",destination.split(",")[1] );

                startActivity(intent);
            }
        });
    }

}
