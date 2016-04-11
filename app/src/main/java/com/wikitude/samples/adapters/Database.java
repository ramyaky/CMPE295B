package com.wikitude.samples.adapters;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.provider.SyncStateContract;
import android.util.Log;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Created by Susmitha on 3/3/2016.
 */
public class Database extends SQLiteOpenHelper {

    public static final String ADDRESS_TABLE = "address_book";
    public static final String Col_ID = "id";
    public static final String Col_lat = "lat";
    public static final String Col_long = "long";

    public Database(Context context) {
        super(context, "findmycar.db", null, 1);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {

        String tableCreate = String.format("CREATE TABLE %s (%s INTEGER PRIMARY KEY , %s TEXT NOT NULL , %s TEXT NOT NULL)", ADDRESS_TABLE, Col_ID, Col_lat, Col_long);
        String insertOneEntry = "INSERT INTO address_book VALUES(1,'1','1')";
        System.out.println("tableCreate: "+ tableCreate);

        System.out.println("insertOneEntry: "+ insertOneEntry);
        db.execSQL(tableCreate);
        db.execSQL(insertOneEntry);
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {

    }

    public void modifyAddress(String lat, String lon){

        final String[] whereArgs = { "1" };

        SQLiteDatabase db = getWritableDatabase();

        ContentValues cv = new ContentValues();

        cv.put(Col_lat,lat);

        cv.put(Col_long,lon);

        int result = db.update(ADDRESS_TABLE, cv, "id = ?", whereArgs);

        db.close();

    }


    public String getDestination(int id){

        SQLiteDatabase db = getReadableDatabase();
        String lat = "";
        String lon = "";

        String sql = String.format("SELECT * FROM %s WHERE id = %d", ADDRESS_TABLE, id);

        Cursor cursor = db.rawQuery(sql, null);

        while(cursor.moveToNext()){

            lat = cursor.getString(1);
            lon = cursor.getString(2);


        }
        db.close();

        return lat +","+ lon;
    }

}
