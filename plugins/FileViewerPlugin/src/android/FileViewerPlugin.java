package com.spideroak.fileviewerplugin;

import java.util.HashMap;
import java.util.Map;

import java.io.File;

import org.apache.cordova.DroidGap;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Intent;
import android.net.Uri;
import android.util.Log;
import android.text.Html;
import android.webkit.MimeTypeMap;

import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;

/**
 * This plugin is basically a minimal version of Boris Smus's WebIntents plugin,
 * details below:
 *
 * WebIntent is a PhoneGap plugin that bridges Android intents and web
 * applications:
 * 
 * 1. web apps can spawn intents that call native Android applications.
 * 
 * @author boris@borismus.com
 * 
 */
public class FileViewerPlugin extends Plugin {

  private static final String LOG_TAG = "FileViewerPlugin";

  private String onNewIntentCallback = null;

  /**
   * Executes the request and returns PluginResult.
   * 
   * @param action
   *            The action to execute.
   * @param args
   *            JSONArray of arguments for the plugin.
   * @param callbackId
   *            The callback id used when calling back into JavaScript.
   * @return A PluginResult object with a status and message.
   */
  public PluginResult execute(String action, JSONArray args,
                                            String callbackId) {
    try {
      if (action.equals("view")) {
        if (args.length() != 1) {
          return new PluginResult(PluginResult.Status.INVALID_ACTION);
        }
        // Log.d(LOG_TAG, action);

        // Parse the arguments
        JSONObject obj = args.getJSONObject(0);
        MimeTypeMap mime = MimeTypeMap.getSingleton();
        Uri uri = obj.has("url") ? Uri.parse(obj.getString("url")) : null;
        String ext=mime.getFileExtensionFromUrl(Uri.encode(uri.toString()));
        String type = obj.has("type") ? obj.getString("type") : mime.getMimeTypeFromExtension(ext);
        
        JSONObject extras = obj.has("extras") ? obj.getJSONObject("extras") : null;
        Map<String, String> extrasMap = new HashMap<String, String>();

        // Populate the extras if any exist
        if (extras != null) {
          JSONArray extraNames = extras.names();
          for (int i = 0; i < extraNames.length(); i++) {
            String key = extraNames.getString(i);
            String value = extras.getString(key);
            extrasMap.put(key, value);
          }
        }

        view(obj.getString("action"), uri, type, extrasMap);
        return new PluginResult(PluginResult.Status.OK);
      }
      return new PluginResult(PluginResult.Status.INVALID_ACTION);
    } catch (JSONException e) {
      e.printStackTrace();
      return new PluginResult(PluginResult.Status.JSON_EXCEPTION);
    }
  }

  @Override
  public void onNewIntent(Intent intent) {
    if (this.onNewIntentCallback != null) {
      PluginResult result = new PluginResult(PluginResult.Status.OK, intent.getDataString());
      result.setKeepCallback(true);
      this.success(result, this.onNewIntentCallback);
    }
  }

  void view(String action, Uri uri, String type, 
                                      Map<String, String> extras) {
    Intent i = (uri != null ? new Intent(action, uri) : new Intent(action));
    
    if (type != null && uri != null) {
      i.setDataAndType(uri, type); //Fix the crash problem with android 2.3.6
    } else {
      if (type != null) {
        i.setType(type);
      }
    }
    
    for (String key : extras.keySet()) {
      String value = extras.get(key);
      // If type is text html, the extra text must sent as HTML
      if (key.equals(Intent.EXTRA_TEXT) && type.equals("text/html")) {
        i.putExtra(key, Html.fromHtml(value));
      } else if (key.equals(Intent.EXTRA_STREAM)) {
        // allowes sharing of images as attachments.
        // value in this case should be a URI of a file
        i.putExtra(key, Uri.parse(value));
      } else if (key.equals(Intent.EXTRA_EMAIL)) {
        // allows to add the email address of the receiver
        i.putExtra(Intent.EXTRA_EMAIL, new String[] { value });
      } else {
        i.putExtra(key, value);
      }
    }
    ((DroidGap)this.cordova.getActivity()).startActivity(i);
  }

  // void sendBroadcast(String action, Map<String, String> extras) {
  //  Intent intent = new Intent();
  //  intent.setAction(action);
  //  for (String key : extras.keySet()) {
  //    String value = extras.get(key);
  //    intent.putExtra(key, value);
  //  }

  //  ((DroidGap)this.cordova.getActivity()).sendBroadcast(intent);
  // }
}
