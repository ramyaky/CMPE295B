package com.wikitude.samples;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ImageButton;

import com.wikitude.samples.utils.urllauncher.Catalog;
import com.wikitude.sdksamples.R;

public class MainActivity extends Activity {

    public static final String EXTRAS_KEY_ACTIVITY_TITLE_STRING = "activityTitle";
    public static final String EXTRAS_KEY_ACTIVITY_ARCHITECT_WORLD_URL = "activityArchitectWorldUrl";

    public static final String EXTRAS_KEY_ACTIVITY_IR = "activityIr";
    public static final String EXTRAS_KEY_ACTIVITY_GEO = "activityGeo";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        ImageButton snaptoscreenButton = (ImageButton) findViewById(R.id.snaptoscreenButton);
        ImageButton catalog = (ImageButton)findViewById(R.id.catalog_button);
        ImageButton poiButton = (ImageButton) findViewById(R.id.poiButton);
        snaptoscreenButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                Intent intent = new Intent(getApplicationContext(), SampleCamActivity.class);
                intent.putExtra(EXTRAS_KEY_ACTIVITY_ARCHITECT_WORLD_URL, "samples/snapToScreen/index.html");
                intent.putExtra(EXTRAS_KEY_ACTIVITY_IR, true);
                intent.putExtra(EXTRAS_KEY_ACTIVITY_GEO, false);
                startActivity(intent);

            }
        });


         catalog.setOnClickListener(new View.OnClickListener() {
             @Override
             public void onClick(View v) {

                 Intent catalogIntent = new Intent(MainActivity.this,Catalog.class);
                 startActivity(catalogIntent);

             }
         });

        poiButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(getApplicationContext(), SampleCamActivity.class);
                intent.putExtra(EXTRAS_KEY_ACTIVITY_ARCHITECT_WORLD_URL, "samples/pointOfInterests/index.html");
                intent.putExtra(EXTRAS_KEY_ACTIVITY_IR, false);
                intent.putExtra(EXTRAS_KEY_ACTIVITY_GEO, true);
                startActivity(intent);
            }
        });

    }

}
