package com.opora.mobile;

import android.content.res.Configuration;
import android.graphics.Color;
import android.os.Bundle;
import androidx.annotation.NonNull;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String LIGHT_BACKGROUND = "#F7FAF7";
    private static final String DARK_BACKGROUND = "#18211F";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WindowCompat.enableEdgeToEdge(getWindow());
        applySystemThemeBackground();
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().requestApplyInsets();
        }
    }

    @Override
    public void onConfigurationChanged(@NonNull Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        applySystemThemeBackground();
    }

    private void applySystemThemeBackground() {
        boolean darkMode = (getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK)
            == Configuration.UI_MODE_NIGHT_YES;
        int backgroundColor = Color.parseColor(darkMode ? DARK_BACKGROUND : LIGHT_BACKGROUND);
        getWindow().getDecorView().setBackgroundColor(backgroundColor);
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().setBackgroundColor(backgroundColor);
        }
    }
}
