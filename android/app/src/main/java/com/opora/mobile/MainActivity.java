package com.opora.mobile;

import android.graphics.Color;
import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String APP_BACKGROUND = "#0A0F24";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WindowCompat.enableEdgeToEdge(getWindow());
        applySystemThemeBackground();
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().requestApplyInsets();
        }
    }

    private void applySystemThemeBackground() {
        int backgroundColor = Color.parseColor(APP_BACKGROUND);
        getWindow().getDecorView().setBackgroundColor(backgroundColor);
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().setBackgroundColor(backgroundColor);
        }
    }
}
