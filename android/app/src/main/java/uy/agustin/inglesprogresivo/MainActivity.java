package uy.agustin.inglesprogresivo;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Plugin propio: abrir los ajustes de texto a voz del teléfono.
        registerPlugin(TtsSettingsPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
