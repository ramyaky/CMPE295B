package com.wikitude.samples.utils.urllauncher;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.ImageView;

import com.wikitude.sdksamples.R;

/**
 * Created by sravyadara on 10/9/15.
 */
public class ImageAdapter extends BaseAdapter {

    private Context mContext;
    private final int[] imageId;

    public ImageAdapter(Context c,int[] imageId){
        this.mContext=c;
        this.imageId=imageId;
    }
    @Override
    public int getCount() {
        return imageId.length;
    }

    @Override
    public Object getItem(int position) {
        return null;
    }

    @Override
    public long getItemId(int position) {
        return 0;
    }

    @Override

    // create a new ImageView for each item referenced by the Adapter
    public View getView(int position, View convertView, ViewGroup parent) {
        View grid;
        ImageView imageView;
        LayoutInflater inflater = (LayoutInflater) mContext
                .getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        if (convertView == null) {
            // if it's not recycled, initialize some attributes
            grid= new View(mContext);
            grid = inflater.inflate(R.layout.list_item, null);
            imageView = (ImageView)grid.findViewById(R.id.image);
            imageView.setImageResource(imageId[position]);

        } else {
            grid = (View) convertView;

        }


        return grid;
    }



}
