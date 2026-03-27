package com.pachangapp.services;

import com.itextpdf.html2pdf.HtmlConverter;
import com.pachangapp.models.Reserva;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class PdfService {

    public byte[] generateReservaPdf(Reserva reserva) {
        ByteArrayOutputStream target = new ByteArrayOutputStream();
        
        String html = "<html><body>" +
                "<h1>Justificante de Reserva - PachangApp</h1>" +
                "<p><strong>Reserva ID:</strong> " + reserva.getId() + "</p>" +
                "<p><strong>Usuario:</strong> " + reserva.getUsuario().getUsername() + " (" + reserva.getUsuario().getEmail() + ")</p>" +
                "<p><strong>Pista:</strong> " + reserva.getCampo().getNombre() + "</p>" +
                "<p><strong>Zona:</strong> " + reserva.getCampo().getZona() + "</p>" +
                "<p><strong>Deporte:</strong> " + reserva.getCampo().getDeporte() + "</p>" +
                "<p><strong>Fecha:</strong> " + reserva.getFecha() + "</p>" +
                "<p><strong>Hora:</strong> " + reserva.getHoraInicio() + "</p>" +
                "<p><strong>Precio:</strong> " + reserva.getCampo().getPrecioPorHora() + "€</p>" +
                "<br><p>Gracias por confiar en PachangApp.</p>" +
                "</body></html>";

        HtmlConverter.convertToPdf(html, target);
        return target.toByteArray();
    }

    public byte[] generateGeneralReport(List<Reserva> reservas) {
        ByteArrayOutputStream target = new ByteArrayOutputStream();
        
        StringBuilder sb = new StringBuilder();
        sb.append("<html><body style='font-family: Arial, sans-serif;'>");
        sb.append("<h1 style='color: #059669;'>Reporte General de Reservas - PachangApp</h1>");
        sb.append("<p>Número total de reservas: <strong>").append(reservas.size()).append("</strong></p>");
        sb.append("<table border='1' style='width: 100%; border-collapse: collapse;'>");
        sb.append("<tr style='background-color: #f3f4f6;'><th>ID</th><th>Usuario</th><th>Campo</th><th>Fecha</th><th>Hora</th></tr>");
        
        for (Reserva r : reservas) {
            sb.append("<tr>");
            sb.append("<td>").append(r.getId()).append("</td>");
            sb.append("<td>").append(r.getUsuario().getEmail()).append("</td>");
            sb.append("<td>").append(r.getCampo().getNombre()).append("</td>");
            sb.append("<td>").append(r.getFecha()).append("</td>");
            sb.append("<td>").append(r.getHoraInicio()).append("</td>");
            sb.append("</tr>");
        }
        
        sb.append("</table>");
        sb.append("<p style='margin-top: 20px; font-size: 10px; color: #6b7280;'>Generado automáticamente por el Administrador.</p>");
        sb.append("</body></html>");

        HtmlConverter.convertToPdf(sb.toString(), target);
        return target.toByteArray();
    }
}
