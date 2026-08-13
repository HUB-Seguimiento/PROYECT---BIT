// ============================================================
//  Lógica y plantilla compartidas entre buttons.html (formulario)
//  y vista-previa.html (solo lectura). Un solo lugar para el diseño
//  del formato oficial, así ambos se ven siempre igual.
// ============================================================

        var DIAS_POR_BITACORA = 15;
        var MAX_BITACORAS = 12;
        var MIN_ACTIVIDADES = 3;

        function formatFechaInput(d) {
            var y = d.getUTCFullYear();
            var m = String(d.getUTCMonth() + 1).padStart(2, '0');
            var day = String(d.getUTCDate()).padStart(2, '0');
            return y + '-' + m + '-' + day;
        }

        function formatFechaVisible(d) {
            return formatFechaInput(d).split('-').reverse().join('/');
        }

        function parseFechaInput(str) {
            var partes = str.split('-');
            return new Date(Date.UTC(parseInt(partes[0], 10), parseInt(partes[1], 10) - 1, parseInt(partes[2], 10)));
        }

        // Convierte una fecha en formato "yyyy-mm-dd" (como vienen los <input type="date">) a "dd/mm/yyyy"
        function formatearFechaDDMMYYYY(str) {
            if (!str) return '';
            var partes = str.split('-');
            if (partes.length !== 3) return str;
            return partes[2] + '/' + partes[1] + '/' + partes[0];
        }

        function periodoParaNumero(fechaInicioStr, numero) {
            if (!fechaInicioStr || !numero) return null;
            var inicioEtapa = parseFechaInput(fechaInicioStr);
            var desde = new Date(inicioEtapa);
            desde.setUTCDate(desde.getUTCDate() + (numero - 1) * DIAS_POR_BITACORA);
            var hasta = new Date(desde);
            hasta.setUTCDate(hasta.getUTCDate() + DIAS_POR_BITACORA - 1);
            return { desde: formatFechaInput(desde), hasta: formatFechaInput(hasta) };
        }

        var FORM_STATE_KEY = 'bitacoraFormState';
        var ESTADO = { campos: {}, alternativa: '', competencias: [], porBitacora: {}, firmas: {} };

        function cargarEstadoDesdeStorage() {
            var raw;
            try { raw = sessionStorage.getItem(FORM_STATE_KEY); } catch (e) { return; }
            if (!raw) return;
            try {
                var guardado = JSON.parse(raw);
                ESTADO.campos = guardado.campos || {};
                ESTADO.alternativa = guardado.alternativa || '';
                ESTADO.competencias = guardado.competencias || [];
                ESTADO.porBitacora = guardado.porBitacora || {};
                ESTADO.firmas = guardado.firmas || {};
            } catch (e) { /* estado corrupto, se ignora */ }
        }

        function escapeHtml(texto) {
            var div = document.createElement('div');
            div.textContent = texto == null ? '' : texto;
            return div.innerHTML;
        }

        var TEXTO_DECRETO = 'Decreto 055 de 2015, por el cual se reglamenta la afiliación de estudiantes al Sistema General de Riesgos Laborales y se dictan otras disposiciones';
        var TEXTO_ESPACIO_OBLIGATORIO = 'Este espacio debe ser siempre diligenciado.';
        var TEXTO_ARTICULO_11 = 'Artículo 11. Obligaciones de la institución de educación. Corresponde a las instituciones de educación a las que pertenezcan los estudiantes, que deban ser afiliados al Sistema General de Riesgos Laborales de conformidad con el presente decreto:';
        var TEXTO_OBLIGACION_1 = '1. Revisar periódicamente que el estudiante en práctica desarrolle labores relacionadas exclusivamente con su programa de formación o educación, que ameritaron su afiliación al Sistema General de Riesgos Laborales.';
        var TEXTO_OBLIGACION_2 = '2. Verificar que el espacio de práctica cuente con los elementos de protección personal apropiados según el riesgo ocupacional.';

        // ------------------------------------------------------------------
        // Cuadrícula de 8 columnas (equivalentes a las columnas B..I del Excel
        // oficial), con los anchos REALES extraídos de esa hoja. Se usa la MISMA
        // cuadrícula en TODAS las tablas del documento, así los bordes de
        // cualquier fila coinciden verticalmente con los de cualquier otra fila,
        // en toda la página — igual que en el archivo original.
        // ------------------------------------------------------------------
        var ANCHOS_COLUMNAS_8 = [13.73, 8.78, 10.87, 10.08, 11.37, 11.37, 16.46, 17.34]; // B,C,D,E,F,G,H,I
        var COLGROUP_8 = '<colgroup>' + ANCHOS_COLUMNAS_8.map(function (w) { return '<col style="width:' + w + '%">'; }).join('') + '</colgroup>';
        function tablaGrid(contenidoFilas, margenInferior) {
            return '<table style="width:100%;border-collapse:collapse;table-layout:fixed;' + (margenInferior !== false ? 'margin-bottom:6px;' : '') + '">' +
                COLGROUP_8 + contenidoFilas + '</table>';
        }

        function barraNegra(texto) {
            return '<div style="background:#000;color:#fff;font-weight:bold;text-align:center;padding:3px 4px;border:1px solid #000;font-size:9px;">' + escapeHtml(texto) + '</div>';
        }
        function barraBlanca(texto) {
            return '<div style="background:#fff;color:#000;font-weight:bold;text-align:center;padding:3px 4px;border:1px solid #000;font-size:9px;">' + escapeHtml(texto) + '</div>';
        }
        function celdaEtiqueta(texto, colspan, rowspan) {
            return '<td colspan="' + (colspan || 1) + '"' + (rowspan ? ' rowspan="' + rowspan + '"' : '') + ' style="border:1px solid #000;background:#f2f2f2;font-weight:bold;text-align:center;font-size:7.5px;padding:2px 3px;">' + escapeHtml(texto) + '</td>';
        }
        function celdaEtiquetaOscura(texto, colspan) {
            return '<td colspan="' + (colspan || 1) + '" style="border:1px solid #000;background:#000;color:#fff;font-weight:bold;text-align:center;font-size:7px;padding:2px 3px;">' + escapeHtml(texto) + '</td>';
        }
        function celdaValor(texto, alinear, colspan, rowspan) {
            return '<td colspan="' + (colspan || 1) + '"' + (rowspan ? ' rowspan="' + rowspan + '"' : '') + ' style="border:1px solid #000;text-align:' + (alinear || 'left') + ';font-size:8px;padding:3px 4px;">' + escapeHtml(texto || '') + '</td>';
        }
        function celdaLibre(contenidoHtml, colspan, rowspan, extraEstilo) {
            return '<td colspan="' + (colspan || 1) + '"' + (rowspan ? ' rowspan="' + rowspan + '"' : '') + ' style="border:1px solid #000;text-align:center;padding:3px;' + (extraEstilo || '') + '">' + contenidoHtml + '</td>';
        }
        function casilla(marcada) {
            return '<div style="width:9px;height:9px;border:1px solid #000;margin:0 auto;background:' + (marcada ? '#000' : '#fff') + ';"></div>';
        }

        function construirHtmlBitacora(datos, bit, logoDataUrl) {
            var c = datos.campos;

            var filasActividades = '';
            var totalFilas = Math.max(5, bit.actividades.length);
            for (var i = 0; i < totalFilas; i++) {
                var act = bit.actividades[i] || {};
                var evidenciaTexto = act.evidencia_texto || (act.evidencia_imagen ? '(ver imagen adjunta)' : '');
                filasActividades += '<tr>' +
                    celdaValor(act.descripcion, 'center', 2) +
                    celdaValor(act.competencias, 'center', 2) +
                    celdaValor(act.fecha_inicio, 'center', 1) +
                    celdaValor(act.fecha_fin, 'center', 1) +
                    celdaValor(evidenciaTexto, 'center', 1) +
                    celdaValor(act.observaciones, 'center', 1) +
                    '</tr>';
            }

            var mapaAlt = {
                'Contrato de aprendizaje': 'altContrato',
                'Monitoria': 'altMonitoria',
                'Proyecto productivo': 'altProyecto',
                'Contrato de vínculo formativo': 'altVinculo',
                'Vínculo laboral': 'altLaboral'
            };
            var altMarcada = mapaAlt[datos.alternativa] || '';
            function xSi(id) { return altMarcada === id ? 'X' : ''; }

            function bloqueFirma(dataUrl) {
                return dataUrl ? '<img src="' + dataUrl + '" style="max-height:50px;max-width:130px;">' : '&nbsp;';
            }

            return '' +
                '<div style="width:780px;padding:14px;font-family:Arial,Helvetica,sans-serif;color:#000;font-size:8px;">' +

                // Encabezado: logo (columnas B-H) + Código/Versión (columna I)
                tablaGrid(
                    '<tr>' +
                    celdaLibre(logoDataUrl ? '<img src="' + logoDataUrl + '" style="height:38px;">' : '', 7) +
                    '<td style="border:1px solid #000;padding:0;">' +
                    '<div style="border-bottom:1px solid #000;padding:3px;font-size:8px;">Código: GFPI-F-147</div>' +
                    '<div style="padding:3px;font-size:8px;">Versión: 05</div>' +
                    '</td>' +
                    '</tr>'
                ) +

                barraNegra('PROCESO') +
                barraBlanca('GESTIÓN DE FORMACIÓN PROFESIONAL INTEGRAL') +
                barraNegra('NOMBRE DEL FORMATO') +
                barraBlanca('FORMATO BITÁCORA DE SEGUIMIENTO ETAPA PRODUCTIVA') +
                barraNegra('CLASIFICACIÓN DE LA INFORMACIÓN') +

                // Pública (B) / casilla (C-D) / Pública Clasificada (E-F) / casilla (G) / Pública Reservada (H) / casilla (I)
                tablaGrid(
                    '<tr>' +
                    celdaValor('Pública', 'left', 1) +
                    celdaLibre(casilla(true), 2) +
                    celdaValor('Pública Clasificada', 'left', 2) +
                    celdaLibre(casilla(false), 1) +
                    celdaValor('Pública Reservada', 'left', 1) +
                    celdaLibre(casilla(false), 1) +
                    '</tr>'
                ) +

                // Bitácora N° (B-D) / Período a reportar (E-I)
                tablaGrid(
                    '<tr>' + celdaEtiqueta('Bitácora N°', 3) + celdaEtiqueta('PERÍODO A REPORTAR', 5) + '</tr>' +
                    '<tr>' + celdaValor(bit.numero, 'center', 3) +
                    celdaLibre('Desde <strong>' + escapeHtml(formatearFechaDDMMYYYY(bit.periodoDesde)) + '</strong> hasta <strong>' + escapeHtml(formatearFechaDDMMYYYY(bit.periodoHasta)) + '</strong>', 5, 1, 'font-size:8px;') +
                    '</tr>'
                ) +

                barraNegra('Datos del aprendiz') +
                tablaGrid(
                    // Nombre (B-D) / Tipo doc (E) / N° identificación (F-G) / Teléfono (H-I)
                    '<tr>' + celdaEtiqueta('NOMBRE DEL APRENDIZ', 3) + celdaEtiqueta('TIPO DE DOCUMENTO', 1) + celdaEtiqueta('NUMERO DE IDENTIFICACION', 2) + celdaEtiqueta('TELEFONO', 2) + '</tr>' +
                    '<tr>' + celdaValor(c.aprendiz_nombre, 'center', 3) + celdaValor(c.aprendiz_tipo_doc, 'center', 1) + celdaValor(c.aprendiz_num_doc, 'center', 2) + celdaValor(c.aprendiz_telefono, 'center', 2) + '</tr>' +
                    // Correo institucional (B-D) / Correo personal (E-G) / Dirección (H-I)
                    '<tr>' + celdaEtiqueta('Correo electrónico institucional', 3) + celdaEtiqueta('Correo electrónico personal', 3) + celdaEtiqueta('Direccion Residencial', 2) + '</tr>' +
                    '<tr>' + celdaValor(c.aprendiz_correo_institucional, 'center', 3) + celdaValor(c.aprendiz_correo_personal, 'center', 3) + celdaValor(c.aprendiz_direccion, 'center', 2) + '</tr>' +
                    // Número de grupo (B-D) / Modalidad (E-G) / Programa (H-I)
                    '<tr>' + celdaEtiqueta('Numero de Grupo', 3) + celdaEtiqueta('Modalidad', 3) + celdaEtiqueta('Programa de Formacion', 2) + '</tr>' +
                    '<tr>' + celdaValor(c.aprendiz_ficha, 'center', 3) + celdaValor(c.aprendiz_modalidad_formacion, 'center', 3) + celdaValor(c.aprendiz_programa, 'center', 2) + '</tr>' +
                    // Modalidad de ejecución (B-D) / Exterior (E-G) / País (H-I)
                    '<tr>' +
                    celdaEtiqueta('Modalidad de ejecución de la etapa productiva (presencial o virtual)', 3) +
                    celdaEtiqueta('¿Realiza la etapa productiva con una entidad u organización en el exterior? (si o no)', 3) +
                    celdaEtiqueta('País donde realiza la etapa productiva', 2) +
                    '</tr>' +
                    '<tr>' + celdaValor(c.modalidad_ejecucion, 'center', 3) + celdaValor(c.etapa_exterior, 'center', 3) + celdaValor(c.etapa_pais, 'center', 2) + '</tr>'
                ) +

                barraNegra('Datos del ente co-formador') +
                tablaGrid(
                    // Empresa (B-E) / NIT (F-G) / Dirección (H-I)
                    '<tr>' + celdaEtiqueta('Nombre de la entidad, empresa, institución u organización', 4) + celdaEtiqueta('NIT', 2) + celdaEtiqueta('Dirección', 2) + '</tr>' +
                    '<tr>' + celdaValor(c.empresa_nombre, 'center', 4) + celdaValor(c.empresa_nit, 'center', 2) + celdaValor(c.empresa_direccion, 'center', 2) + '</tr>'
                ) +

                barraNegra('Datos de la persona encargada del proceso formativo del aprendiz en la entidad co-formadora') +
                tablaGrid(
                    // Nombre (B-D) / Cargo (E-F) / Teléfono (G) / Correo (H-I)
                    '<tr>' + celdaEtiqueta('Nombre completo del ente co-formador (Jefe inmediato/Supervisor)', 3) + celdaEtiqueta('Cargo del ente co-formador', 2) + celdaEtiqueta('Contacto telefónico', 1) + celdaEtiqueta('Correo electrónico', 2) + '</tr>' +
                    '<tr>' + celdaValor(c.coformador_nombre, 'center', 3) + celdaValor(c.coformador_cargo, 'center', 2) + celdaValor(c.coformador_telefono, 'center', 1) + celdaValor(c.coformador_correo, 'center', 2) + '</tr>'
                ) +

                barraNegra('Datos del instructor de seguimiento') +
                tablaGrid(
                    // Nombre (B-F) / Correo (G-I)
                    '<tr>' + celdaEtiqueta('Nombre completo del instructor de seguimiento', 5) + celdaEtiqueta('Correo electrónico del instructor de seguimiento', 3) + '</tr>' +
                    '<tr>' + celdaValor(c.instructor_nombre, 'center', 5) + celdaValor(c.instructor_correo, 'center', 3) + '</tr>'
                ) +

                '<div style="border:1px solid #000;padding:3px;font-size:7.5px;margin-bottom:4px;">Seleccione con una "X" el tipo de alternativa de etapa productiva que está realizando, teniendo en cuenta el subtipo al cual pertenece si es el caso:</div>' +

                // Alternativa (B) / Marque X (C-F) / Alternativa (G) / Marquen X (H-I)
                tablaGrid(
                    '<tr>' + celdaEtiqueta('Alternativa de etapa productiva', 1) + celdaEtiqueta('Marque con una X', 4) + celdaEtiqueta('Alternativa de etapa productiva', 1) + celdaEtiqueta('Marquen con una X', 2) + '</tr>' +
                    '<tr>' +
                    celdaValor('Contrato de aprendizaje', 'left', 1) + celdaLibre('<strong>' + xSi('altContrato') + '</strong>', 4) +
                    celdaValor('Monitoria', 'left', 1) + celdaLibre('<strong>' + xSi('altMonitoria') + '</strong>', 2) +
                    '</tr>' +
                    '<tr>' +
                    celdaValor('Vínculo Formativo', 'left', 1, 2) + celdaLibre('<strong>' + xSi('altVinculo') + '</strong>', 4, 2) +
                    celdaValor('Proyecto productivo', 'left', 1) + celdaLibre('<strong>' + xSi('altProyecto') + '</strong>', 2) +
                    '</tr>' +
                    '<tr>' +
                    celdaValor('Vínculo laboral', 'left', 1) + celdaLibre('<strong>' + xSi('altLaboral') + '</strong>', 2) +
                    '</tr>'
                ) +

                // Descripción (B-C) / Competencias (D-E) / F.inicio (F) / F.fin (G) / Evidencia (H) / Observaciones (I)
                tablaGrid(
                    '<tr>' +
                    celdaEtiquetaOscura('DESCRIPCIÓN DE LA ACTIVIDAD', 2) +
                    celdaEtiquetaOscura('Competencias del programa de formación aplicadas en el desarrollo de la actividad', 2) +
                    celdaEtiquetaOscura('FECHA DE INICIO', 1) +
                    celdaEtiquetaOscura('FECHA DE FIN', 1) +
                    celdaEtiquetaOscura('EVIDENCIA DE CUMPLIMIENTO', 1) +
                    celdaEtiquetaOscura('OBSERVACIONES, INASISTENCIAS, DIFICULTADES', 1) +
                    '</tr>' +
                    filasActividades
                ) +

                '<div style="border:1px solid #000;background:#f2f2f2;font-weight:bold;text-align:center;font-size:7.5px;padding:2px;">' + escapeHtml(TEXTO_DECRETO) + '</div>' +
                '<div style="border:1px solid #000;font-size:7.5px;padding:2px;">' + escapeHtml(TEXTO_ESPACIO_OBLIGATORIO) + '</div>' +
                '<div style="border:1px solid #000;font-size:7px;padding:3px;margin-bottom:4px;">' +
                escapeHtml(TEXTO_ARTICULO_11) + '<br>' + escapeHtml(TEXTO_OBLIGACION_1) + '<br>' + escapeHtml(TEXTO_OBLIGACION_2) +
                '</div>' +

                // ARL: ¿afiliado? (B-C) / nivel riesgo (D-E) / ¿corresponde? (F-G) / ¿EPP? (H-I)
                tablaGrid(
                    '<tr>' +
                    celdaEtiqueta('¿La persona con rol de aprendiz se encuentra afiliado a la ARL?', 2) +
                    celdaEtiqueta('Indique el nivel de riesgo actual', 2) +
                    celdaEtiqueta('¿El nivel de riesgo corresponde a las actividades que desarrolla en la empresa?', 2) +
                    celdaEtiqueta('¿Cuenta con los elementos de protección personal (EPP) requeridos?', 2) +
                    '</tr>' +
                    '<tr>' + celdaValor(c.arl_afiliado, 'center', 2) + celdaValor(c.arl_nivel_riesgo, 'center', 2) + celdaValor(c.arl_nivel_corresponde, 'center', 2) + celdaValor(c.arl_epp, 'center', 2) + '</tr>'
                ) +

                // Firmas: Aprendiz + Fecha (B-E / F-I), Instructor + Co-formador (B-E / F-I)
                tablaGrid(
                    '<tr>' +
                    celdaLibre(bloqueFirma(datos.firmas.firmaAprendiz), 4, 1, 'height:50px;border-bottom:0;') +
                    celdaLibre(escapeHtml(c.fecha_entrega || ''), 4, 1, 'border-bottom:0;') +
                    '</tr>' +
                    '<tr>' +
                    celdaLibre('Firma de la persona con rol de aprendiz', 4, 1, 'border-top:0;font-size:7.5px;') +
                    celdaLibre('Fecha entrega bitácora', 4, 1, 'border-top:0;font-size:7.5px;') +
                    '</tr>' +
                    '<tr>' +
                    celdaLibre(bloqueFirma(datos.firmas.firmaInstructor), 4, 1, 'height:50px;border-bottom:0;') +
                    celdaLibre(bloqueFirma(datos.firmas.firmaCoformador), 4, 1, 'border-bottom:0;') +
                    '</tr>' +
                    '<tr>' +
                    celdaLibre('Firma del instructor de seguimiento', 4, 1, 'border-top:0;font-size:7.5px;') +
                    celdaLibre('Firma de la persona con rol de jefe inmediato', 4, 1, 'border-top:0;font-size:7.5px;') +
                    '</tr>',
                    false
                ) +

                '</div>';
        }

        // Nombre de archivo: Ficha - Cédula - Nombre completo - BIT
        function construirNombreArchivo(datos) {
            var partes = [
                datos.campos.aprendiz_ficha || 'sinficha',
                datos.campos.aprendiz_num_doc || 'sincedula',
                datos.campos.aprendiz_nombre || 'sinnombre',
                'BIT'
            ];
            var nombre = partes.join(' - ');
            return nombre.replace(/[\\/:*?"<>|]/g, '-');
        }
