package com.wikitude.samples.utils.urllauncher;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.Toast;

import com.jpardogo.listbuddies.lib.views.ListBuddiesLayout;
import com.wikitude.samples.ProductDetails;
import com.wikitude.samples.adapters.CircularAdapter;
import com.wikitude.sdksamples.R;

import java.util.Arrays;

public class Catalog extends Activity {

 @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_catalog);


        final ListBuddiesLayout listBuddies = (ListBuddiesLayout) findViewById(R.id.listbuddies);
        CircularAdapter adapter = new CircularAdapter(getApplicationContext(), getResources().getDimensionPixelSize(R.dimen.image_size1), Arrays.asList(ImageUrls.imageUrls_left));
        CircularAdapter adapter2 = new CircularAdapter(getApplicationContext(), getResources().getDimensionPixelSize(R.dimen.image_size2), Arrays.asList(ImageUrls.imageUrls_right));
        listBuddies.setAdapters(adapter, adapter2);

        listBuddies.setOnItemClickListener(new ListBuddiesLayout.OnBuddyItemClickListener() {
            @Override
            public void onBuddyItemClicked(AdapterView<?> adapterView, View view, int i, int i1, long l) {

                String s = (String)adapterView.getItemAtPosition(i1);

                Toast.makeText(Catalog.this, s, Toast.LENGTH_SHORT).show();
                Intent item = new Intent(Catalog.this, ProductDetails.class);
                item.putExtra("imageUrl",s);
                startActivity(item);

            }
        });
    }
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_catalog, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }
}
