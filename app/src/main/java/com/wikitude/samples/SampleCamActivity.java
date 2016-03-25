package com.wikitude.samples;

import java.io.File;
import java.io.FileOutputStream;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.hardware.SensorManager;
import android.location.LocationListener;
import android.net.Uri;
import android.os.Environment;
import android.util.Log;
import android.widget.Toast;

import com.wikitude.architect.ArchitectView;
import com.wikitude.architect.ArchitectView.ArchitectUrlListener;
import com.wikitude.architect.ArchitectView.CaptureScreenCallback;
import com.wikitude.architect.ArchitectView.SensorAccuracyChangeListener;
import com.wikitude.architect.StartupConfiguration.CameraPosition;
import com.wikitude.sdksamples.R;

public class SampleCamActivity extends AbstractArchitectCamActivity {

	/**
	 * last time the calibration toast was shown, this avoids too many toast shown when compass needs calibration
	 */
	private long lastCalibrationToastShownTimeMillis = System.currentTimeMillis();

	@Override
	public String getARchitectWorldPath() {
		Log.d("SAMPLE_CAM_ACTIVITY", "Inside getARchitectWorldPath");
		return getIntent().getExtras().getString(
				MainActivity.EXTRAS_KEY_ACTIVITY_ARCHITECT_WORLD_URL);
	}

	@Override
	public String getActivityTitle() {
		Log.d("SAMPLE_CAM_ACTIVITY", "Inside getActivityTitle");
		return (getIntent().getExtras() != null && getIntent().getExtras().get(
				MainActivity.EXTRAS_KEY_ACTIVITY_TITLE_STRING) != null) ? getIntent()
				.getExtras().getString(MainActivity.EXTRAS_KEY_ACTIVITY_TITLE_STRING)
				: "ARIOD";
	}

	@Override
	public int getContentViewId() {
		Log.d("SAMPLE_CAM_ACTIVITY", "Inside getContentViewId");
		return R.layout.sample_cam;
	}

	@Override
	public int getArchitectViewId() {

		Log.d("SAMPLE_CAM_ACTIVITY", "Inside getArchitectViewId");
		return R.id.architectView;
	}

	@Override
	public String getWikitudeSDKLicenseKey() {
		Log.d("SAMPLE_CAM_ACTIVITY", "Inside getWikitudeSDKLicenseKey");
		return WikitudeSDKConstants.WIKITUDE_SDK_KEY;
	}

	@Override
	public SensorAccuracyChangeListener getSensorAccuracyListener() {
		Log.d("SAMPLE_CAM_ACTIVITY", "Inside getSensorAccuracyListener");
		return new SensorAccuracyChangeListener() {
			@Override
			public void onCompassAccuracyChanged(int accuracy) {
				/* UNRELIABLE = 0, LOW = 1, MEDIUM = 2, HIGH = 3 */
				if (accuracy < SensorManager.SENSOR_STATUS_ACCURACY_MEDIUM && SampleCamActivity.this != null && !SampleCamActivity.this.isFinishing() && System.currentTimeMillis() - SampleCamActivity.this.lastCalibrationToastShownTimeMillis > 5 * 1000) {
					Toast.makeText(SampleCamActivity.this, R.string.compass_accuracy_low, Toast.LENGTH_LONG).show();
					SampleCamActivity.this.lastCalibrationToastShownTimeMillis = System.currentTimeMillis();
				}
			}
		};
	}

	@Override
	public ArchitectUrlListener getUrlListener() {
		Log.d("SAMPLE_CAM_ACTIVITY", "Inside getUrlListener");
		return new ArchitectUrlListener() {

			@Override
			public boolean urlWasInvoked(String uriString) {
				System.out.println("SAMPLE_CAM_ACTIVITY --> " + uriString);
				Uri invokedUri = Uri.parse(uriString);
				Log.d("SAMPLE_CAM_ACTIVITY", invokedUri.toString());
				System.out.println("SAMPLE_CAM_ACTIVITY --> " + invokedUri.getHost() + " -- " + invokedUri.getQueryParameter("id"));

				if("poidirection".equalsIgnoreCase(invokedUri.getHost())) {
					//geo:37.7749,-122.4194
					String latitude = String.valueOf(invokedUri.getQueryParameter("latitude"));
					String longitude = String.valueOf(invokedUri.getQueryParameter("longitude"));
					final Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("google.navigation:q="+latitude+","+longitude+"&mode=w"));
					startActivity(intent);
				}else if("poitelephone".equalsIgnoreCase(invokedUri.getHost())){
					final Intent intent = new Intent(Intent.ACTION_CALL, Uri.parse("tel:"+invokedUri.getQueryParameter("telephone")));
					startActivity(intent);
				}

				// pressed "More" button on POI-detail panel
				if ("markerselected".equalsIgnoreCase(invokedUri.getHost())) {
					final Intent poiDetailIntent = new Intent(SampleCamActivity.this, SamplePoiDetailActivity.class);
					poiDetailIntent.putExtra(SamplePoiDetailActivity.EXTRAS_KEY_POI_ID, String.valueOf(invokedUri.getQueryParameter("id")) );
					poiDetailIntent.putExtra(SamplePoiDetailActivity.EXTRAS_KEY_POI_TITILE, String.valueOf(invokedUri.getQueryParameter("title")) );
					poiDetailIntent.putExtra(SamplePoiDetailActivity.EXTRAS_KEY_POI_DESCR, String.valueOf(invokedUri.getQueryParameter("description")) );
					SampleCamActivity.this.startActivity(poiDetailIntent);
					return true;
				}
				
				// pressed snapshot button. check if host is button to fetch e.g. 'architectsdk://button?action=captureScreen', you may add more checks if more buttons are used inside AR scene
				else if ("button".equalsIgnoreCase(invokedUri.getHost())) {
					SampleCamActivity.this.architectView.captureScreen(ArchitectView.CaptureScreenCallback.CAPTURE_MODE_CAM_AND_WEBVIEW, new CaptureScreenCallback() {
						
						@Override
						public void onScreenCaptured(final Bitmap screenCapture) {
							// store screenCapture into external cache directory
							final File screenCaptureFile = new File(Environment.getExternalStorageDirectory().toString(), "screenCapture_" + System.currentTimeMillis() + ".jpg");
							
							// 1. Save bitmap to file & compress to jpeg. You may use PNG too
							try {
								final FileOutputStream out = new FileOutputStream(screenCaptureFile);
								screenCapture.compress(Bitmap.CompressFormat.JPEG, 90, out);
								out.flush();
								out.close();
							
								// 2. create send intent
								final Intent share = new Intent(Intent.ACTION_SEND);
								share.setType("image/jpg");
								share.putExtra(Intent.EXTRA_STREAM, Uri.fromFile(screenCaptureFile));
		
								// 3. launch intent-chooser
								final String chooserTitle = "Share Snaphot";
								SampleCamActivity.this.startActivity(Intent.createChooser(share, chooserTitle));
							
							} catch (final Exception e) {
								// should not occur when all permissions are set
								SampleCamActivity.this.runOnUiThread(new Runnable() {
									
									@Override
									public void run() {
										// show toast message in case something went wrong
										Toast.makeText(SampleCamActivity.this, "Unexpected error, " + e, Toast.LENGTH_LONG).show();	
									}
								});
							}
						}
					});
				}
				return true;
			}
		};
	}

	@Override
	public ILocationProvider getLocationProvider(final LocationListener locationListener) {
		Log.d("SAMPLE_CAM_ACTIVITY", "Inside getLocationProvider");
		return new LocationProvider(this, locationListener);
	}
	
	@Override
	public float getInitialCullingDistanceMeters() {
		Log.d("SAMPLE_CAM_ACTIVITY", "Inside getInitialCullingDistanceMeters");
		// you need to adjust this in case your POIs are more than 50km away from user here while loading or in JS code (compare 'AR.context.scene.cullingDistance')
		return ArchitectViewHolderInterface.CULLING_DISTANCE_DEFAULT_METERS;
	}

	@Override
	protected boolean hasGeo() {
		Log.d("SAMPLE_CAM_ACTIVITY", "Inside hasGeo");
		return getIntent().getExtras().getBoolean(
				MainActivity.EXTRAS_KEY_ACTIVITY_GEO);
	}

	@Override
	protected boolean hasIR() {
		Log.d("SAMPLE_CAM_ACTIVITY", "Inside hasIR");
		return getIntent().getExtras().getBoolean(
				MainActivity.EXTRAS_KEY_ACTIVITY_IR);
	}

	@Override
	protected CameraPosition getCameraPosition() {
		Log.d("SAMPLE_CAM_ACTIVITY", "Inside getCameraPosition");
		return CameraPosition.DEFAULT;
	}
}
