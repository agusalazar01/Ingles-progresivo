package uy.agustin.inglesprogresivo;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Plugin propio: abrir los ajustes de texto a voz del teléfono.
        registerPlugin(TtsSettingsPlugin.class);
        // IA sin internet para la llamada con Oliver (voz, oído y charla).
        registerPlugin(OliverAiPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
