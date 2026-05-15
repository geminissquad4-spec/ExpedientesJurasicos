const CRONOLOGIA = [
  {
    year: "1975",
    title: "Fundación de InGen",
    severity: "normal",
    content: `<p>InGen (International Genetic Technologies, Inc.) es fundada por John Hammond y Benjamin Lockwood, con la visión de revolucionar la ingeniería genética y la biotecnología.</p>`
  },
  {
    year: "1978",
    title: "El sueño comienza",
    severity: "normal",
    content: `<p>Hammond y Lockwood inician la planificación para traer dinosaurios de vuelta a la vida.</p><p>Se establece un laboratorio en la mansión de Lockwood para los primeros experimentos genéticos.</p><p>Paralelamente, buscan el lugar ideal para albergar un parque temático con estas criaturas prehistóricas.</p>`
  },
  {
    year: "1979",
    title: "Buscar inversionistas",
    severity: "normal",
    content: `<p>Hammond invierte en un proyecto de experimentación genética cuyo objetivo es crear una versión miniatura de un elefante. Su intención es utilizar a estos pequeños ejemplares como una demostración tecnológica capaz de atraer inversionistas interesados en financiar su ambicioso proyecto de clonación de dinosaurios.</p><p>Lo que John no revelaba es que estas criaturas no sobrevivían por mucho tiempo, por lo que debía clonarlas continuamente para mantener la ilusión de éxito. Aun así, la estrategia funcionó: gracias a estas demostraciones, consiguió reunir a varios inversionistas y dar inicio al proyecto que más tarde se convertiría en <span class="chrono-project">Jurassic Park</span>.</p>`
  },
  {
    year: "1980",
    title: "Inversión en ámbar y paleontología",
    severity: "normal",
    content: `<p>Hammond adquiere múltiples minas de ámbar, siendo la principal en República Dominicana.</p><p>También compra sitios de excavación paleontológica, incluyendo uno en Montana donde trabaja el Dr. Alan Grant.</p>`
  },
  {
    year: "1983",
    title: "Jurassic Park San Diego",
    severity: "normal",
    content: `<p>Comienza la construcción del primer parque de dinosaurios en San Diego, California.</p>`
  },
  {
    year: "1984",
    title: "El primer intento fallido",
    severity: "normal",
    content: `<p>Científicos logran revivir al primer animal prehistórico a partir de ADN de ámbar en el laboratorio de Lockwood, pero el espécimen muere poco después.</p><p>Aunque el experimento es desacreditado, llama la atención de la empresa rival BioSyn Genetics, iniciando una carrera genética.</p>`
  },
  {
    year: "1985",
    title: "Primeros conflictos y expansión",
    severity: "normal",
    content: `<p>Hammond y Lockwood consideran usar islas tropicales para construir una instalación autosuficiente gracias a la energía geotérmica.</p><p>John presenta su plan a inversionistas y logra que el gobierno de Costa Rica le arriende <span class="chrono-island">Isla Nublar</span> e <span class="chrono-island">Isla Sorna</span>.</p><p>Se comienza la construcción de laboratorios y cercados en <span class="chrono-island">Sorna</span>.</p><p>Ese mismo año, Dennis Nedry, un prometedor programador, comienza su carrera profesional en InGen.</p>`
  },
  {
    year: "1986",
    title: "Primer dinosaurio clonado",
    severity: "normal",
    content: `<p>Una científica logra clonar exitosamente un <span class="chrono-carnivore">Velociraptor</span>, aunque el animal resulta ser extremadamente agresivo y debe ser sacrificado.</p><p>El logro es nuevamente desacreditado, pero representa un avance significativo.</p>`
  },
  {
    year: "1988",
    title: "ADN de rana y renacimiento del sueño",
    severity: "normal",
    content: `<p>Hammond contacta al Dr. Henry Wu, quien propone usar ADN de rana para completar los fragmentos genéticos faltantes de dinosaurios.</p><p>Con esta técnica, se clona exitosamente un <span class="chrono-herbivore">Triceratops</span>, seguido por <span class="chrono-carnivore">Tyrannosaurus</span>, <span class="chrono-herbivore">Brachiosaurus</span> y <span class="chrono-carnivore">Dilophosaurus</span>. En un inicio no se tenía ni idea de qué animales eran los que creaban, todo fue a la suerte. Se modificó el ADN para que estos no se reproduzcan haciendo que cada ejemplar sea hembra.</p><p>El parque en <span class="chrono-island">Isla Nublar</span> comienza su construcción definitiva aprovechando la energía geotérmica del volcán inactivo <span class="chrono-island">Monte Sibo</span>. Hammond traslada personal desde su zoológico en Kenia, incluyendo al guardabosques Robert Muldoon.</p><p>Ese mismo año, Nedry es asignado como el único programador jefe del sistema de <span class="chrono-project">Jurassic Park</span>.</p>`
  },
  {
    year: "1990",
    title: "Jurassic Park toma forma",
    severity: "normal",
    content: `<p>El parque en <span class="chrono-island">Isla Nublar</span> está casi terminado. Se trasladan múltiples especies de dinosaurios y se instalan las primeras atracciones.</p><p>Hammond, concentrado en terminar el parque, ignora las quejas, convencido de que Nedry es reemplazable.</p><p>Resentido y necesitado de dinero, Nedry empieza a buscar otras formas de obtener ganancias por su trabajo en InGen.</p>`
  },
  {
    year: "1992",
    title: "El espionaje comienza",
    severity: "normal",
    content: `<p>BioSyn descubre que InGen ha clonado con éxito dinosaurios. Su director, Lewis Dodgson, diseña un plan para robar embriones.</p><p>Dodgson identifica a Nedry como un blanco ideal debido a sus problemas financieros y resentimientos hacia Hammond.</p>`
  },
  {
    year: "1993",
    title: "El Incidente del 93 — Catástrofe Total",
    severity: "critical",
    content: `<p>• El parque ya cuenta con una población significativa de dinosaurios: 6 <span class="chrono-herbivore">Brachiosaurus</span>, 15 <span class="chrono-herbivore">Parasaurolophus</span>, 3 <span class="chrono-herbivore">Triceratops</span>, 24 <span class="chrono-herbivore">Gallimimus</span>, 5 <span class="chrono-carnivore">Dilophosaurus</span> y 8 <span class="chrono-carnivore">Velociraptors</span>. También se confirma la presencia de otras especies sin un número conocido: <span class="chrono-herbivore">Stegosaurus</span>, <span class="chrono-herbivore">Segisaurus</span>, <span class="chrono-carnivore">Proceratosaurus</span>, <span class="chrono-carnivore">Baryonyx</span> (aunque existe controversia sobre si en realidad se trataba de un <span class="chrono-carnivore">Suchomimus</span>) y <span class="chrono-carnivore">Metriacanthosaurus</span>.</p>
<p>• Se trabaja en una expansión del parque que incluiría un estanque marino, un aviario y nuevas especies rumoreadas como <span class="chrono-herbivore">Euoplocephalus</span>, <span class="chrono-herbivore">Maiasaura</span>, <span class="chrono-herbivore">Styracosaurus</span>, <span class="chrono-carnivore">Carnotaurus</span>, <span class="chrono-herbivore">Pachycephalosaurus</span> y <span class="chrono-carnivore">Herrerasaurus</span>. Además, se contempla la idea de llevar algunas atracciones a distintos países bajo los proyectos <span class="chrono-project">Jurassic Park: Europa</span> y <span class="chrono-project">Jurassic Park: Japón</span>.</p>
<p><strong><span class="chrono-event">9 de junio de 1993</span>:</strong></p>
<p>• Ocurre un grave incidente durante el traslado de un <span class="chrono-carnivore">Velociraptor</span> a su nuevo recinto. El animal mata a seis de sus congéneres, dejando únicamente a dos sobrevivientes. Esa misma noche, los raptores son trasladados a cuarentena; sin embargo, el mismo <span class="chrono-carnivore">Velociraptor</span> ataca y mata a un trabajador del parque.</p>
<p>• Robert Muldoon exige que los raptores sean sacrificados, pero Hammond se niega. La familia del empleado fallecido demanda a InGen por negligencia. Este evento desencadena la visita de un grupo de expertos a <span class="chrono-island">Isla Nublar</span> para evaluar la viabilidad del parque.</p>
<p><strong><span class="chrono-event">11 de junio de 1993</span>:</strong></p>
<p>• Lewis Dodgson soborna a Dennis Nedry para robar embriones. Una fuerte tormenta azota la isla. Nedry desactiva el sistema de seguridad, permitiendo que los dinosaurios escapen. El <span class="chrono-carnivore">T. Rex</span> y los <span class="chrono-carnivore">Velociraptors</span> provocan múltiples muertes, incluyendo a Donald Gennaro, Robert Muldoon y Ray Arnold. Nedry muere atacado por un <span class="chrono-carnivore">Dilophosaurus</span>.</p>
<p>• Los sobrevivientes (Grant, Sattler, Malcolm y los nietos de Hammond) logran escapar en helicóptero. Tras el colapso, son obligados a firmar acuerdos de confidencialidad. El gobierno de Costa Rica amenaza con bombardear la isla, pero Hammond lo evita mediante negociaciones diplomáticas.</p>
<p>• Benjamin Lockwood supervisa en <span class="chrono-island">Isla Sorna</span> la llegada del material evacuado de <span class="chrono-island">Nublar</span>. Lo acompaña su hija, Charlotte Lockwood, quien desarrolla una estrecha relación de mentoría con el Dr. Henry Wu en genética y biotecnología.</p>`
  },
  {
    year: "1994",
    title: "Operación Limpieza",
    content: `<p>• InGen organiza una misión confidencial llamada “<span class="chrono-project">Operación Limpieza</span>”, cuyo objetivo es recuperar embriones y documentos genéticos de valor en <span class="chrono-island">Isla Nublar</span>, realizar un censo de los dinosaurios aún vivos y contener riesgos biológicos.</p>
<p>• Durante la operación, se descubre una gran población de <span class="chrono-carnivore">Compsognathus</span>, lo que lleva a la teoría de que estos llegaron a <span class="chrono-island">Nublar</span> ocultos en los barcos de carga provenientes de <span class="chrono-island">Isla Sorna</span>.</p>
<p>• Se descubrió que varios dinosaurios habían sobrevivido al “<span class="chrono-project">recurso de la lisina</span>”, un mecanismo genético diseñado para matarlos si no recibían lisina artificial, logrando suplirla a través de su dieta natural.</p>
<p>• Además, se confirmó que los dinosaurios estaban reproduciéndose, lo que fue posible debido a la introducción de ADN de rana, que les otorgó la capacidad de cambiar de sexo en ambientes de un solo género.</p>
<p>• El <span class="chrono-event">huracán Clarissa</span> azota la isla <span class="chrono-island">Sorna</span>, provocando daños irreparables en las instalaciones. El personal se ve obligado a evacuar, liberando a todos los dinosaurios.</p>
<p>• La fauna registrada en <span class="chrono-island">Sorna</span> en ese momento incluye: <span class="chrono-herbivore">Brachiosaurus</span>, <span class="chrono-herbivore">Mamenchisaurus</span>, <span class="chrono-herbivore">Edmontosaurus</span>, <span class="chrono-herbivore">Parasaurolophus</span>, <span class="chrono-herbivore">Triceratops</span>, <span class="chrono-herbivore">Microceratus</span>, <span class="chrono-herbivore">Stegosaurus</span>, <span class="chrono-herbivore">Pachycephalosaurus</span>, <span class="chrono-herbivore">Gallimimus</span>, <span class="chrono-carnivore">Tyrannosaurus Rex</span>, <span class="chrono-carnivore">Velociraptor</span>, <span class="chrono-carnivore">Carnotaurus</span>, <span class="chrono-carnivore">Baryonyx</span>, <span class="chrono-carnivore">Dilophosaurus</span>, <span class="chrono-carnivore">Compsognathus</span> y Geosternbergia.</p>`
  },
  {
    year: "1995",
    title: "Desesperación corporativa",
    severity: "normal",
    content: `<p>InGen sufre una crisis financiera. Peter Ludlow, sobrino de John Hammond, propone explotar <span class="chrono-island">Isla Sorna</span> y trasladar los animales a San Diego. Hammond se opone rotundamente.</p>
<p>Ian Malcolm rompe el silencio y habla públicamente sobre los dinosaurios. Ludlow lanza una campaña de desprestigio, destruyendo su reputación como matemático y divulgador.</p>`
  },
  {
    year: "1996",
    title: "El ascenso de Ludlow",
    severity: "warning",
    content: `<p>Peter Ludlow ordena en secreto una segunda "<span class="chrono-project">Operación Limpieza</span>" en <span class="chrono-island">Isla Sorna</span> para recolectar información genética y justificar su plan de explotación comercial.</p>
<p>Con estos datos, Ludlow prepara un movimiento legal para remover a Hammond del control de InGen y tomar su lugar como presidente de la compañía.</p>`
  },
  {
    year: "1997",
    title: "La batalla por Isla Sorna",
    severity: "critical",
    content: `<p>• Una familia de turistas británicos llega accidentalmente a <span class="chrono-island">Isla Sorna</span>. Su hija sufre un ataque por parte de <span class="chrono-carnivore">Compsognathus</span>, desatando el escándalo. Peter Ludlow usa el incidente para remover a John de la dirección y asumir la presidencia de InGen.</p>
<p>• John Hammond organiza en secreto una expedición científica para documentar a los dinosaurios en su hábitat natural y demostrar que merecen protección. La paleontóloga Sarah Harding es la primera en llegar. El Dr. Ian Malcolm se une al equipo para rescatarla junto a Nick Van Owen (activista), Eddie Carr (experto en logística) y su hija Kelly.</p>
<p>• Paralelamente, Ludlow envía su propia expedición liderada por Roland Tembo para capturar un <span class="chrono-carnivore">Tyrannosaurus Rex</span> como pieza central de un nuevo parque en San Diego. El campamento de Ludlow es saboteado por Nick Van Owen para liberar a los animales atrapados.</p>
<p>• La situación se vuelve crítica: Roland hiere y captura a una cría de <span class="chrono-carnivore">T. Rex</span>, lo que desata la furia de sus padres. Eddie Carr es asesinado por los <span class="chrono-carnivore">T. Rex</span> mientras intenta salvar al equipo. Finalmente, Ludlow logra transportar al <span class="chrono-carnivore">T. Rex</span> adulto a San Diego, donde la criatura escapa y causa estragos en la ciudad.</p>
<p>• Ian y Sarah logran atraer al <span class="chrono-carnivore">T. Rex</span> de vuelta al barco. Peter Ludlow muere a manos de la cría del <span class="chrono-carnivore">T. Rex</span> intentando recapturarlos. El escándalo obliga al gobierno a declarar <span class="chrono-island">Sorna</span> zona de reserva biológica.</p>
<p>• Hammond, en su frágil estado de salud, se reúne con Simon Masrani (CEO de Masrani Global) para acordar un plan de conservación y contención. Antes de finalizar el año, John Hammond fallece por causas naturales.</p>`
  },
  {
    year: "1998",
    title: "Operación Re-Génesis",
    severity: "warning",
    content: `<p>• Mientras la Masrani Global Corporation iniciaba el proceso de absorción financiera y corporativa de InGen, no todos los ejecutivos de InGen compartían la visión de John Hammond ni los valores de Simon Masrani. Durante la transición de poder, uno de los ejecutivos más influyentes (cuyo nombre permanece fuera de los registros oficiales) ordenó una operación encubierta final en <span class="chrono-island">Isla Sorna</span>. Puso en marcha un proyecto clandestino de manipulación genética, bajo el nombre clave: <span class="chrono-project">Operación Re-Génesis</span>. El objetivo de este programa secreto era perfeccionar las técnicas de clonación y ampliar el catálogo genético de InGen mediante métodos innovadores y más agresivos.</p>
<p>• Los principales avances registrados ese año incluyen la reactivación secreta de <span class="chrono-island">Isla Sorna</span> como centro operativo. En su territorio se construyó un nuevo laboratorio, así como zonas de contención especializadas adaptadas a nuevas especies y pruebas más complejas.</p>
<p>• En lugar de los métodos tradicionales basados en huevos, se utilizaron cámaras criogénicas para acelerar y controlar con mayor precisión el desarrollo embrionario de las criaturas.</p>
<p>• A partir del material genético recuperado durante la <span class="chrono-project">Operación Limpieza</span> de 1996, se logró clonar con éxito tres nuevas especies de dinosaurios: <span class="chrono-herbivore">Ankylosaurus</span>, <span class="chrono-herbivore">Corythosaurus</span> y <span class="chrono-carnivore">Ceratosaurus</span>.</p>
<p>• Posteriormente, se adquirió ADN de Pteranodon, lo que impulsó la construcción de una pajarera reforzada para su contención segura.</p>
<p>• Los registros fragmentarios de esta etapa revelan datos inquietantes: alteraciones genéticas experimentales, hibridaciones ilegales y pruebas de resistencia en ejemplares modificados. A pesar del creciente control de Masrani Global, se presume que estas prácticas no se limitaron únicamente a <span class="chrono-island">Isla Sorna</span>. Otras islas menores, utilizadas por InGen como bases de prueba temporales, también habrían sido escenarios de estas actividades. Entre ellas destacan:</p>
<p>• <span class="chrono-island">Isla Matanceros</span>, ubicada al norte de <span class="chrono-island">Isla Nublar</span> dentro del archipiélago de Las Cinco Muertes, mencionada en múltiples informes filtrados.</p>
<p>• <span class="chrono-island">Isla Saint Hubert</span>, una isla de interés estratégico recientemente adquirida por Masrani, cuya historia también se vincula a operaciones biogenéticas no reveladas al público.</p>`
  },
  {
    year: "1999",
    title: "El experimento SP01",
    severity: "warning",
    content: `<p>• A mediados de 1999, se encontró material genético incompleto correspondiente a un <span class="chrono-carnivore">Spinosaurus</span> aegyptiacus. Debido a la gran fragmentación de su genoma, los científicos de InGen decidieron usar ADN complementario de <span class="chrono-carnivore">Suchomimus</span>, <span class="chrono-carnivore">Baryonyx</span> y Cocodrilo del Nilo.</p>
<p>• Esto dio como resultado un espécimen de <span class="chrono-carnivore">Spinosaurus</span> altamente inestable y genéticamente modificado, con un temperamento agresivo, territorial y niveles anormales de inteligencia para un terópodo. El animal era trasladado constantemente entre distintos recintos, lo que lo sometió a un alto grado de estrés y descontrol, convirtiéndolo en un riesgo potencial para todo el ecosistema.</p>
<p>• Se clonó una nueva variante de <span class="chrono-carnivore">Velociraptor</span>, que mostraba rasgos neurológicos avanzados, mayor inteligencia social, y nuevas estructuras craneales (protoplumas en la cabeza). Esta cepa fue considerada peligrosa incluso por los propios científicos.</p>
<p>• Durante una inspección sorpresa, Simon Masrani visitó las instalaciones en <span class="chrono-island">Sorna</span>. Al sostener en brazos a una cría de <span class="chrono-herbivore">Parasaurolophus</span>, Masrani quedó profundamente conmovido por el potencial de una convivencia armónica entre humanos y dinosaurios.</p>
<p>• A partir de esa experiencia personal, nació su intención de construir un nuevo parque temático. Ese mismo año, Masrani obtuvo finalmente el control legal completo sobre <span class="chrono-island">Isla Nublar</span>, <span class="chrono-island">Isla Sorna</span> e <span class="chrono-island">Isla Saint Hubert</span>, hasta entonces usada como centro de pruebas no oficiales.</p>`
  },
  {
    year: "2000",
    title: "Investigaciones legales y la Ley de Guardia Genética",
    severity: "warning",
    content: `<p>• El aumento de rumores, filtraciones y la actividad irregular en <span class="chrono-island">Sorna</span> llamó la atención del gobierno de los Estados Unidos, específicamente del Comité de Bioseguridad y Control Genético.</p>
<p>• Tras una larga inspección, se descubrió que InGen había violado la <span class="chrono-project">Ley de Guardia Genética</span>, aprobada tras los sucesos en San Diego en 1997. Esta ley prohíbe explícitamente la clonación y modificación de ADN prehistórico para fines no regulados, experimentación o creación de híbridos.</p>
<p>• Los documentos incautados revelaron el alcance de la <span class="chrono-project">Operación Re-Génesis</span>, incluyendo los experimentos con el <span class="chrono-carnivore">Spinosaurus</span>, los nuevos raptores, y las alteraciones no autorizadas en otras especies.</p>
<p>• Aunque se debatió públicamente la posibilidad de intervención armada o cierre forzado, el conflicto legal fue silenciado por presión corporativa y acuerdos políticos encubiertos, dejando a <span class="chrono-island">Sorna</span> fuera de límites para cualquier presencia civil o científica.</p>`
  },
  {
    year: "2001",
    title: "Rescate en Sorna",
    severity: "critical",
    content: `<p>• Pese a las restricciones legales, el tráfico de información genética y la curiosidad pública nunca cesaron. Ese año, ocurrió un incidente que volvió a poner a <span class="chrono-island">Isla Sorna</span> en el ojo de la tormenta.</p>
<p>• Paul y Amanda Kirby, una pareja divorciada, organizaron una excursión ilegal a <span class="chrono-island">Sorna</span> bajo el pretexto de una expedición turística. En realidad, buscaban a su hijo Eric Kirby, quien había desaparecido semanas antes tras un accidente aéreo sobre la isla.</p>
<p>• Para ello, contrataron al Dr. Alan Grant, paleontólogo de renombre, engañándolo con una oferta falsa de financiamiento para sus investigaciones.</p>
<p>• Grant accede, acompañado por su joven asistente Billy Brennan, sin saber que volvían al epicentro de la pesadilla.</p>
<p>• El grupo se estrella en la isla y descubre que los ecosistemas han cambiado drásticamente.</p>
<p>• Son atacados por el <span class="chrono-carnivore">Spinosaurus</span> modificado, que mató a varios miembros del equipo.</p>
<p>• Descubren a los nuevos <span class="chrono-carnivore">Velocirraptores</span>, más inteligentes y organizados, con estructuras óseas inéditas.</p>
<p>• Se descubre que el ecosistema de la isla se ve amenazado por las nuevas especies, principalmente por el <span class="chrono-carnivore">Spinosaurus</span>, ya que caza ferozmente a la población de <span class="chrono-carnivore">Tyrannosaurus</span>.</p>
<p>• Tras varios enfrentamientos y muertes, el grupo logra escapar con vida gracias a la intervención del ejército estadounidense, quien había sido alertado mediante una llamada de auxilio enviada por la Doctora Ellie Sattler.</p>
<p>• Un grupo de Pteranodones escapa de <span class="chrono-island">Isla Sorna</span>, llegando hasta Oklahoma, donde son vistos por las zonas rurales, Vic Hoskins se encarga de capturar a estos animales.</p>
<p>• Simon Masrani, preocupado por la seguridad de futuras operaciones, contrata a Vic Hoskins para reformar completamente la división de seguridad de InGen, dotándola de entrenamiento táctico y visión paramilitar.</p>`
  },
  {
    year: "2002",
    title: "Construcción de Jurassic World",
    severity: "normal",
    content: `<p>Comienza oficialmente la construcción de Jurassic World en <span class="chrono-island">Isla Nublar</span>. Los animales de <span class="chrono-island">Sorna</span> y <span class="chrono-island">Nublar</span> son capturados y transportados. Se encuentra al <span class="chrono-carnivore">Tyrannosaurus</span> de <span class="chrono-project">Jurassic Park</span> en estado de desnutrición.</p>
<p>Durante los traslados se pierden múltiples especímenes, incluido el <span class="chrono-carnivore">Spinosaurus</span> modificado, cuyo paradero se vuelve un misterio.</p>`
  },
  {
    year: "2003",
    title: "Primeros errores y encubrimiento",
    severity: "warning",
    content: `<p>Masrani lanza un programa de pasantías internacionales. Durante una visita, una pasante muere por el ataque de un dinosaurio no especificado.</p>
<p>Masrani suspende indefinidamente las pasantías, elimina todos los registros del incidente y refuerza los protocolos de encubrimiento.</p>`
  },
  {
    year: "2004",
    title: "Mentes Brillantes y expansión biológica",
    severity: "normal",
    content: `<p>• Masrani relanza un programa limitado bajo el nombre de “<span class="chrono-project">Mentes Brillantes</span>”, con medidas de seguridad extremas. Claire Dearing es aceptada y destaca rápidamente en la organización.</p>
<p>• Comienza la población del parque con las primeras especies: <span class="chrono-herbivore">Triceratops</span>, <span class="chrono-herbivore">Brachiosaurus</span>, <span class="chrono-herbivore">Gallimimus</span>, <span class="chrono-herbivore">Parasaurolophus</span>, <span class="chrono-herbivore">Ankylosaurus</span>, y la <span class="chrono-carnivore">Tyrannosaurus</span> original, ahora conocida como <span class="chrono-carnivore">Rexy</span>.</p>
<p>• Un <span class="chrono-carnivore">Velociraptor</span> procedente de <span class="chrono-island">Sorna</span> es trasladado a <span class="chrono-island">Nublar</span> para estudio, pero escapa tras un incidente vinculado a espionaje corporativo. Aunque es recapturado, es reubicado en la <span class="chrono-island">Isla de Hubert</span>.</p>
<p>• Claire forja una amistad cercana con Simon Masrani, quien le ofrece un puesto oficial en Jurassic World.</p>`
  },
  {
    year: "2005",
    title: "Inauguración de Jurassic World",
    severity: "normal",
    content: `<p>Jurassic World abre sus puertas el 30 de mayo de 2005. El parque representa una nueva era de turismo biotecnológico con medidas de seguridad de última generación y atracciones de alto nivel.</p>`
  },
  {
    year: "2007",
    title: "Comercialización",
    severity: "normal",
    content: `<p>Masrani recibe múltiples ofertas de inversionistas internacionales. Destaca Daniel Kon, un empresario visionario con fuerte presencia en el sector tecnológico y biotecnológico, quien se convierte en uno de los principales socios estratégicos del parque. Su participación aportó recursos económicos y tecnología de punta para la gestión de recintos y control de animales.</p>`
  },
  {
    year: "2008",
    title: "Proyectos híbridos y aberraciones genéticas",
    severity: "warning",
    content: `<p>Masrani y el Dr. Wu discuten cómo aumentar el interés comercial. Wu propone crear una nueva especie híbrida.</p>
<p>Los experimentos en <span class="chrono-island">Saint Hubert</span> generan fallos: <strong><span class="chrono-hybrid">Mutadons</span></strong> (híbridos <span class="chrono-carnivore">Velociraptor</span>-Pteranodon) y el <strong><span class="chrono-hybrid">Distortus Rex</span></strong> (<span class="chrono-carnivore">T. Rex</span> con genoma sobrecargado).</p>
<p>En <span class="chrono-island">Nublar</span> se crea el <strong><span class="chrono-hybrid">Scorpius Rex</span></strong> cuyos componentes genéticos son altamente clasificados. Escapa brevemente y ataca al Dr. Wu. Masrani ordena su destrucción, pero Wu, desobedeciendo, lo conserva en estado criogénico en un sitio oculto.</p>`
  },
  {
    year: "2009",
    title: "Nace la Indominus Rex",
    severity: "warning",
    content: `<p>Wu consigue un éxito con la <span class="chrono-hybrid">Indominus Rex</span>, resultado de un complejo cruce genético. Se crean dos ejemplares por protocolo de respaldo.</p>`
  },
  {
    year: "2010",
    title: "Proyecto Ares y caos en Saint Hubert",
    severity: "critical",
    content: `<p>Wu y Hoskins comienzan a colaborar en secreto en el <span class="chrono-project">Proyecto Ares</span>, orientado a militarizar dinosaurios.</p>
<p>Ese mismo año, el <span class="chrono-hybrid">Distortus Rex</span> escapa en la isla de <span class="chrono-island">Saint Hubert</span>, provocando evacuación total y cierre de las instalaciones. La isla queda abandonada y sellada oficialmente.</p>`
  },
  {
    year: "2012",
    title: "Proyecto IBRIS y la llegada de Owen Grady",
    severity: "normal",
    content: `<p>InGen lanza el programa IBRIS (Integrated Behavioral Raptor Intelligence Study). V-2, un raptor agresivo e inestable, es sacrificado por no responder al adiestramiento.</p>
<p>Hoskins recluta a Owen Grady, exmilitar con experiencia en conducta animal. El <span class="chrono-carnivore">Mosasaurus</span> llega a Jurassic World. Es construido el Aviario.</p>`
  },
  {
    year: "2014",
    title: "La manada de Blue",
    severity: "normal",
    content: `<p>Se clonan cuatro lotes de Velociraptores. Solo un ejemplar de cada lote sobrevive: <strong><span class="chrono-carnivore">Blue</span></strong> (líder empática), <span class="chrono-carnivore">Delta</span>, <span class="chrono-carnivore">Echo</span> y <span class="chrono-carnivore">Charlie</span>. Owen establece lazos de liderazgo y obediencia, aunque advierte que el control no es absoluto.</p>`
  },
  {
    year: "2015",
    title: "La caída de Jurassic World",
    severity: "critical",
    content: `<p>• El parque Jurassic World, dirigido por Simon Masrani y con operaciones de Claire Dearing, se encuentra en su punto más alto de éxito con miles de visitantes diarios. Se exhiben 20 especies, pero se sabe que más de 40 especies se encontraban en el parque.</p>
<p>• Masrani inaugura el <span class="chrono-project">Campamento Cretácico</span>, una experiencia exclusiva para seis adolescentes: Darius Bowman, Brooklynn, Yazmina Fadoula, Kenji Kon, Ben Pincus y Sammy Gutiérrez (enviada secretamente por Mantah Corp).</p>
<p>• Se introducen especies como <span class="chrono-herbivore">Sinoceratops</span> y <span class="chrono-herbivore">Parasaurolophus</span> Lux. Ben presencia el nacimiento de <span class="chrono-herbivore">Bumpy</span>, una <span class="chrono-herbivore">Ankylosaurus</span> con la que genera un vínculo afectivo.</p>
<p>• La <span class="chrono-hybrid">Indominus Rex</span> simula haber escapado manipulando su temperatura corporal para evadir sensores térmicos. Finalmente escapa de su recinto matando a personal del parque. Simon Masrani muere en un accidente fatal pilotando su helicóptero tras la liberación de Pteranodones y Dimorphodones.</p>
<p>• Mientras el caos se desata, los campistas quedan aislados y pierden comunicación con el centro de control. Descubren que el parque está colapsando al encontrar instalaciones abandonadas y jaulas rotas. Son atacados por la <span class="chrono-hybrid">Indominus</span> en el laboratorio principal.</p>
<p>• Owen Grady y Claire Dearing intentan localizar a sus sobrinos. Owen usa su manada de Velocirraptores (<span class="chrono-carnivore">Blue</span>, <span class="chrono-carnivore">Delta</span>, <span class="chrono-carnivore">Charlie</span>, <span class="chrono-carnivore">Echo</span>) para rastrear a la <span class="chrono-hybrid">Indominus</span>, pero se revela que esta comparte ADN de Raptor, asumiendo el liderazgo de la manada. Vic Hoskins muere devorado y tres miembros de la Raptor Squad mueren.</p>
<p>• En la batalla final, <span class="chrono-carnivore">Rexy</span> es liberada por Claire. Ella y <span class="chrono-carnivore">Blue</span> unen fuerzas para derrotar a la <span class="chrono-hybrid">Indominus</span>, quien es arrastrada por el <span class="chrono-carnivore">Mosasaurus</span> hacia el fondo de su laguna.</p>
<p>• Los visitantes son evacuados, pero los campistas no logran llegar a los puntos de extracción, quedando abandonados en <span class="chrono-island">Isla Nublar</span>. Logran sobrevivir gracias a su cooperación y conocimiento del terreno.</p>
<p>• El grupo detecta la presencia de cazadores furtivos (Mitch, Tiff y Hap) cuyo objetivo era cazar dinosaurios por beneficio económico. Los sobrevivientes sabotean sus planes. Hap sacrifica su vida para proteger a los menores, mientras Mitch y Tiff mueren tras ser atacados por dinosaurios.</p>
<p>• En una instalación oculta al norte de la isla, el grupo encuentra documentos que hacen referencia a proyectos de investigación genética abandonados, distintos a la creación de la <span class="chrono-hybrid">Indominus Rex</span>.</p>`
  },
  {
    year: "2016",
    title: "Secretos de Jurassic World y Mantah Corp",
    severity: "critical",
    content: `<p>• Se descubre una atracción secreta que se mantuvo cerrada desde la apertura del parque: el <span class="chrono-carnivore">Tarbosaurus</span> escapa de su recinto tras haber sido ocultado en aislamiento. En instalaciones subterráneas, los campistas descubren al <span class="chrono-hybrid">Scorpius Rex</span>, un híbrido inestable anterior a la <span class="chrono-hybrid">Indominus</span> creado por Henry Wu. El espécimen se descongela y escapa, reproduciéndose por partenogénesis. Los jóvenes logran eliminar a ambas criaturas en el centro de visitantes abandonado de <span class="chrono-project">Jurassic Park</span> mediante una explosión.</p>
<p>• Un equipo de recuperación enviado por Wu intenta extraer ADN de la <span class="chrono-hybrid">Indominus</span> del fondo de la laguna. Durante la operación, liberan accidentalmente al <span class="chrono-carnivore">Mosasaurus</span> hacia mar abierto. Los sobrevivientes escapan de <span class="chrono-island">Nublar</span> en el bote de Mitch y Tiff, pero son atacados por el <span class="chrono-carnivore">Mosasaurus</span> y la corriente los arrastra hasta una isla secreta de Mantah Corp.</p>
<p>• La isla de Mantah Corp funciona como centro clandestino de investigación genética con biomas artificiales (selvas, desiertos, tundras, pantanos). Allí encuentran especies como el <span class="chrono-carnivore">Spinosaurus</span> de <span class="chrono-island">Sorna</span>, híbridos <span class="chrono-hybrid">Spinoceratops</span>, dos <span class="chrono-carnivore">T. Rex</span> (Comelona Grande y Chica), <span class="chrono-herbivore">Kentrosaurus</span>, <span class="chrono-carnivore">Dilophosaurus</span>, Pteranodones, <span class="chrono-carnivore">Nothosaurus</span> y <span class="chrono-carnivore">Smilodon</span>.</p>
<p>• La Dra. Mae Turner se une a los campistas para detener el abuso de la corporación. Se revela que Daniel Kon dirige Mantah Corp en alianza con Lewis Dodgson (CEO de BioSyn). Buscan el control conductual de dinosaurios mediante chips neurales. Tras sabotear los sistemas y estabilizar el núcleo de energía (lo que activa el <span class="chrono-island">Monte Sibo</span> en <span class="chrono-island">Nublar</span>), Kon es arrestado y los jóvenes son rescatados por Dave, Roxie y el hermano de Darius.</p>
<p>• Los jóvenes son reconocidos como “Los Seis de <span class="chrono-island">Nublar</span>”. Claire Dearing enfrenta problemas legales por la creación de la <span class="chrono-hybrid">Indominus</span>, y Eli Mills trabaja con el Dr. Wu en el proyecto Ares.</p>`
  },
  {
    year: "2017",
    title: "Caída de InGen y fundación del DPG",
    severity: "warning",
    content: `<p>• Claire Dearing, tras meses enfrentando múltiples demandas por negligencia e irregularidades en el manejo de Jurassic World, gana su juicio legal, siendo declarada inocente. Esto la impulsa a buscar redención.</p>
<p>• Eli Mills, asistente personal de Benjamin Lockwood, y el Doctor Henry Wu logran un gran avance en el <span class="chrono-project">Proyecto Ares</span>, perfeccionando al <span class="chrono-hybrid">Indoraptor</span>, un híbrido con fines bélicos desarrollado a partir del ADN del <span class="chrono-carnivore">Velociraptor</span> y del <span class="chrono-hybrid">Indominus Rex</span>.</p>
<p>• Masrani Global Corporation e InGen finalmente caen en bancarrota, declarando su disolución oficial tras pagar los múltiples daños legales y financieros que se arrastraban desde 1980.</p>
<p>• Owen Grady y Claire Dearing intentan rehacer sus vidas juntos, pero tras un mes de convivencia, se separan.</p>
<p>• Reportes sísmicos indican que el <span class="chrono-island">Monte Sibo</span>, volcán dormido de <span class="chrono-island">Isla Nublar</span>, ha entrado en una fase crítica de implosión volcánica, amenazando con destruir la isla por completo.</p>
<p>• El gobierno estadounidense debate si se debe rescatar a los dinosaurios o dejarlos perecer, al considerarlos una amenaza ecológica.</p>
<p>• En respuesta a esto, Claire funda el <span class="chrono-project">Dinosaur Protection Group</span> (<span class="chrono-project">DPG</span>) con el objetivo de salvar a las criaturas de la extinción. A su causa se unen Zia Rodriguez (paleo veterinaria) y Franklin Webb (experto en sistemas).</p>
<p>• Un hacker anónimo bajo el nombre JURA55IC_H4CKER filtra toda la base de datos secreta de InGen al público, incluyendo experimentos ilegales, manipulaciones genéticas encubiertas y evidencias de tráfico y clonación ilegal. Esta filtración fortalece la causa del <span class="chrono-project">DPG</span> e inspira una ola de campañas sociales a favor de los dinosaurios.</p>`
  },
  {
    year: "2018",
    title: "El Reino Caído",
    severity: "critical",
    content: `<p>• Se convoca un juicio internacional donde el Dr. Ian Malcolm declara que los dinosaurios no deben ser rescatados, pues representan una amenaza ecológica global. Mientras tanto, el <span class="chrono-carnivore">Mosasaurus</span> llega a las costas de Hawái, provocando ataques fatales a surfistas y turistas.</p>
<p>• Benjamin Lockwood planea una operación de rescate secreta con Eli Mills, quien oculta su verdadero objetivo: capturar a <span class="chrono-carnivore">Blue</span> para mejorar al <span class="chrono-hybrid">Indoraptor</span>. Claire, Owen, Zia y Franklin viajan a <span class="chrono-island">Isla Nublar</span> durante la erupción del <span class="chrono-island">Monte Sibo</span>.</p>
<p>• Owen localiza a <span class="chrono-carnivore">Blue</span>, pero esta es herida por un disparo. Zia es secuestrada para estabilizarla, mientras el resto del equipo es abandonado en la isla. Logran escapar en una giroesfera sumergida e infiltrarse en el carguero hacia el continente.</p>
<p>• En la mansión Lockwood, Mills organiza una <span class="chrono-event">subasta secreta</span> de dinosaurios. El <span class="chrono-hybrid">Indoraptor</span> es presentado como el arma biológica definitiva. La criatura escapa matando a compradores y guardias, enfrentándose finalmente a <span class="chrono-carnivore">Blue</span> y Owen hasta caer a su muerte desde el tejado.</p>
<p>• Benjamin Lockwood muere asfixiado por Mills. Maisie Lockwood, revelada como un clon humano de Charlotte Lockwood, libera a los dinosaurios encerrados al sentir empatía por ellos. Mills muere durante el escape masivo.</p>
<p>• Claire y Owen adoptan a Maisie mientras surgen los primeros reportes de ataques en zonas pobladas: <span class="chrono-carnivore">Blue</span> en Nevada, <span class="chrono-carnivore">Rexy</span> en un zoológico, Pteranodones en Las Vegas, y un enfrentamiento entre <span class="chrono-herbivore">Triceratops</span> y <span class="chrono-herbivore">Ankylosaurus</span> en una autopista.</p>`
  },
  {
    year: "2019",
    title: "Los dinosaurios invaden el país",
    severity: "warning",
    content: `<p>• Aumentan los ataques en zonas urbanas: un <span class="chrono-carnivore">Allosaurus</span> ataca un campamento familiar en el parque nacional Big Rock, enfrentando a un par de <span class="chrono-herbivore">Nasutoceratops</span>; escapa tras causar estragos.</p>
<p>• El gobierno establece el Departamento de Vida Silvestre Prehistórica (DVSP) para responder a los ataques y gestionar la presencia de dinosaurios en el continente.</p>
<p>• La <span class="chrono-island">Isla de Mantah</span> es descubierta oficialmente. Todos los dinosaurios y activos biológicos son extraídos de las instalaciones clandestinas.</p>
<p>• Se desconoce el paradero de las criaturas trasladadas tras la desmantelación de la isla, dejando un vacío de información sobre múltiples especímenes únicos.</p>`
  },
  {
    year: "2020",
    title: "Sobreexplotación",
    severity: "warning",
    content: `<p>El mercado negro de dinosaurios florece. Se venden dinosaurios ilegalmente por todo el mundo. La genética extinta se convierte en uno de los productos más codiciados.</p>`
  },
  {
    year: "2021",
    title: "BioSyn regresa",
    severity: "warning",
    content: `<p>• Laboratorios clandestinos comienzan a clonar nuevas especies de dinosaurios. Lewis Dodgson contrata al Dr. Henry Wu y ambos comienzan a clonar dinosaurios con ADN puro.</p>
<p>• Henry informa a Dodgson sobre Maisie Lockwood y sobre una posible cría de la <span class="chrono-carnivore">Velociraptor</span> <span class="chrono-carnivore">Blue</span>, ya que esta podría reproducirse por medio de la partenogénesis. El Dr. Ian Malcolm es contratado por BioSyn como profesor, pero con ayuda de Ramsey Cole (mano derecha de Dodgson) descubre que BioSyn desarrolla langostas prehistóricas gigantes para monopolizar cultivos. Malcolm contacta nuevamente a la Dra. Ellie Sattler.</p>
<p>• Henry clona una nueva especie: los <span class="chrono-carnivore">Atrociraptors</span>, capaces de seguir órdenes precisas. Dodgson propone el proyecto “<span class="chrono-project">Entrenamiento Terópodo Axis</span>” bajo una entrenadora especializada.</p>
<p>• Sin embargo, Dodgson corrompe el propósito original del proyecto, utilizando a los <span class="chrono-carnivore">Atrociraptors</span> para intimidar y eliminar a funcionarios gubernamentales con el fin de obtener permisos e influencia política.</p>`
  },
  {
    year: "2022",
    title: "Caos y Dominio",
    severity: "critical",
    content: `<p>•	Darius Bowman se une a la DVSP, aportando los conocimientos adquiridos en <span class="chrono-island">Isla Nublar</span>. Su experiencia lo convierte en un miembro clave dentro de la organización.</p>
<p>•	Brooklynn y Kenji terminan su relación, iniciada tras escapar de la <span class="chrono-island">Isla de Mantah</span>. Brooklynn pasa algunas semanas viviendo con Darius.</p>
<p>•	Brooklynn y Ben se reúnen con frecuencia para investigar la misteriosa página <span class="chrono-project">Dark Jurassic</span>, donde distintos usuarios denuncian el tráfico ilegal de dinosaurios.</p>
<p>•	Brooklynn se convierte en investigadora activa, siguiendo el rastro del mercado negro de dinosaurios. Durante este periodo contacta a Daniel Kon, ahora en arresto domiciliario, quien le proporciona información a cambio de colaboración. Brooklynn acepta únicamente como espía encubierta.</p>
<p>•	Descubre que el mismo <span class="chrono-carnivore">Allosaurus</span> involucrado en el ataque de 2019 fue adquirido de forma ilegal. También detecta una red de sobornos dentro de la DVSP, donde conductores y oficiales entregan dinosaurios en puntos estratégicos.</p>
<p>•	Brooklynn es descubierta. Una entrenadora de <span class="chrono-carnivore">Atrociraptors</span> es enviada a cazarla. Brooklynn es atacada por los <span class="chrono-carnivore">Atrociraptors</span> y por el <span class="chrono-carnivore">Allosaurus</span>, liberado para matarla. Durante el ataque, uno de los <span class="chrono-carnivore">Atrociraptors</span> le arranca el brazo.</p>
<p>•	Su amiga Ronnie, miembro de la DVSP, la rescata gravemente herida. Darius y otros oficiales llegan después, pero solo encuentran restos que hacen creer que Brooklynn fue devorada. Darius, lleno de culpa por no haberla ayudado antes tras confesarle sus sentimientos, comienza a obsesionarse con capturar al <span class="chrono-carnivore">Allosaurus</span>, ahora apodado “<span class="chrono-carnivore">Killer Eye</span>”.</p>
<p>•	Brooklynn, viva, pero oculta junto a Ronnie, mantiene su supervivencia en secreto para el resto del grupo. A pesar de ello, continúa siendo perseguida.</p>
<p>•	Ben también es cazado por <span class="chrono-carnivore">Atrociraptors</span>. Se reúne con Darius y ambos vuelven a ser atacados.</p>
<p>•	Buscan a Sammy en Texas. Ella revela que logró sacar a <span class="chrono-herbivore">Bumpy</span> de la <span class="chrono-island">Isla de Mantah</span>.</p>
<p>•	El grupo es nuevamente atacado por <span class="chrono-carnivore">Atrociraptors</span>. <span class="chrono-herbivore">Bumpy</span> los defiende, pero es capturada por la DVSP.</p>
<p>•	Se reúnen con Kenji, ahora instructor de alpinismo. Descubren que Brooklynn mantuvo contacto previo con Daniel Kon.</p>
<p>•	Sammy, cuya relación con Yaz está en crisis, parte a buscarla junto a Ben. Yaz vive en una isla de Wyoming declarada libre de dinosaurios, donde pacientes con TEPT utilizan dinosaurios holográficos como terapia.</p>
<p>•	Al llegar, un par de <span class="chrono-carnivore">Becklespinax</span> reales atacan. Muchas personas mueren. Yaz, Ben y Sammy caen en una camioneta por un puente y son dados por muertos.</p>
<p>•	Mientras tanto, Kenji y Darius visitan a Daniel Kon. Este les confirma que Brooklynn hizo una compra a través de él. Ofrece a Kenji continuar su legado, pero este se niega. Daniel, aceptando el rechazo de su hijo, les entrega toda su información antes de morir asesinado por los <span class="chrono-carnivore">Atrociraptors</span>, sacrificándose por Kenji.</p>
<p>•	Yaz, Sammy y Ben sobreviven e ingresan ocultos en un camión de la DVSP que transporta <span class="chrono-carnivore">Becklespinax</span>. Llegan a una base donde descubren que muchos dinosaurios marcados como “fallecidos” están en realidad vivos y en tránsito hacia un puerto.</p>
<p>•	Mateo, un transportista arrepentido de la DVSP, ayuda a Darius y Kenji. Les revela que muchos agentes son contratados para mover dinosaurios sin hacer preguntas. Les entrega el celular de Brooklynn.</p>
<p>•	Gracias al dispositivo encuentran el departamento secreto de Brooklynn, lleno de información sobre los puntos de venta clandestinos.</p>
<p>•	Siguen un camión hasta el puerto, donde coinciden con Yaz, Sammy y Ben. Allí:
Encuentran a <span class="chrono-herbivore">Bumpy</span>, que da a luz un huevo.
El jefe de área de la DVSP es asesinado por los <span class="chrono-carnivore">Atrociraptors</span>.
La entrenadora de los <span class="chrono-carnivore">Atrociraptors</span> aparece y persigue al grupo.</p>
<p>•	Mateo los ayuda a escapar.</p>
<p>•	Los dinosaurios en el puerto escapan, incluido el <span class="chrono-carnivore">Allosaurus</span> “<span class="chrono-carnivore">Killer Eye</span>”.</p>
<p>•	Algunos son transportados a bordo de un barco, incluido el huevo de <span class="chrono-herbivore">Bumpy</span>.</p>
<p>•	Los Cinco de <span class="chrono-island">Nublar</span> restantes (Darius, Kenji, Ben, Sammy y Yaz) abordan el barco y viajan durante semanas rumbo a Senegal.</p>
<p>•	Claire Dearing encabeza el movimiento “<span class="chrono-project">Liberación de Dinosaurios Ahora</span>”, dedicado a proteger a los dinosaurios usados como ganado o entretenimiento.</p>
<p>•	Franklin y Zia ayudan a Claire; sin embargo, después de una misión ambos renuncian.</p>
<p>•	Franklin Webb se une al gobierno para colaborar en la mitigación de incidentes con dinosaurios en zonas urbanas.</p>
<p>•	Mientras tanto, Brooklynn sigue investigando y descubre a una figura clave detrás del mercado ilegal: “La Corredora”, a quien sigue hasta Dubái.</p>
<p>•	Allí descubre que la Corredora es Soyona Santos. En el enfrentamiento, Brooklynn es derrotada porque Santos controla un cuarto <span class="chrono-carnivore">Atrociraptor</span>.</p>
<p>•	Brooklynn logra escapar y contacta a Ben a través de <span class="chrono-project">Dark Jurassic</span>, revelándole que sigue viva. Ben guarda el secreto.</p>
<p>•	Los campistas llegan a Senegal, donde encuentran dinosaurios sueltos, entre ellos:
Una <span class="chrono-herbivore">Gallimimus</span> apodada <span class="chrono-herbivore">Geba</span> por una familia local.
<span class="chrono-herbivore">Stegosaurus</span> y <span class="chrono-carnivore">Suchomimus</span>.</p>
<p>•	Brooklynn vuelve a encontrarse con Soyona Santos y forman una alianza temporal.</p>
<p>•	El grupo descubre una base de clonación ilegal donde un científico crea nuevas especies, entre ellas un dinosaurio genéticamente alterado:</p>
<p>•	Un <span class="chrono-carnivore">Baryonyx</span> leucístico, albino y ciego, que usa ecolocalización.</p>
<p>•	Brooklynn y Santos llegan a la base, pero el científico las traiciona. En el enfrentamiento:
Santos demuestra control sobre su <span class="chrono-carnivore">Atrociraptor</span>.
El científico controla al <span class="chrono-carnivore">Baryonyx</span> mediante chasquidos.
El <span class="chrono-carnivore">Atrociraptor</span>, altamente inteligente, vocaliza para dominar al <span class="chrono-carnivore">Baryonyx</span> y ambos acaban con el científico.</p>
<p>•	Brooklynn se reúne brevemente con el grupo, pero decide no quedarse. Escapa junto a Santos, quien revela su intención de reunirse con Lewis Dodgson para trabajar con BioSyn.</p>
<p>•	Brooklynn y Santos llegan a Malta, específicamente al mercado negro Amber Clave, epicentro del tráfico ilegal de dinosaurios.</p>
<p>•	Mientras tanto, los Cinco de <span class="chrono-island">Nublar</span> (Darius, Kenji, Yaz, Ben y Sammy) se encuentran en Senegal, donde conocen a Barry Sembène, excolaborador de Owen Grady en el proyecto IBRIS. Barry, ahora aliado en la lucha contra el tráfico ilegal, les ofrece transporte hacia Malta.</p>
<p>•	BioSyn Genetics cierra un acuerdo con la ONU para hacerse cargo de los dinosaurios como entidad oficial de custodia. La ONU les autoriza resguardarlos en su nueva instalación: <span class="chrono-island">BioSyn Valley</span>, un santuario naturalizado en los Alpes Dolomitas.</p>
<p>•	Los dinosaurios capturados por la DVSP son transferidos a <span class="chrono-island">BioSyn Valley</span> bajo el control de Pesca y Fauna, incluida la <span class="chrono-carnivore">Tyrannosaurus Rex</span> de <span class="chrono-island">Isla Nublar</span>.</p>
<p>•	BioSyn anuncia haber clonado nuevos dinosaurios a partir de ADN puro, obteniendo prestigio internacional mientras oculta otros experimentos.</p>
<p>•	En Estados Unidos se reporta una plaga de langostas prehistóricas que devora extensas áreas agrícolas. La Dra. Ellie Sattler comienza a investigar.</p>
<p>•	Ellie obtiene una langosta capturada por granjeros y se la lleva al Dr. Alan Grant, buscando su ayuda para infiltrarse en BioSyn y obtener pruebas. Ian Malcolm les da acceso a las instalaciones desde dentro.</p>
<p>•	En Nevada, Owen Grady colabora con Pesca y Fauna para contener dinosaurios que amenazan zonas urbanas. Claire protege a Maisie Lockwood, cuya existencia como el primer clon humano ha sido revelada; el gobierno busca capturarla para estudiarla.</p>
<p>•	En la misma región se descubre que <span class="chrono-carnivore">Blue</span>, la velociraptor sobreviviente de <span class="chrono-island">Nublar</span>, vive en un bosque cercano. Sorprendentemente, se ha reproducido por partenogénesis, dando origen a Beta.</p>
<p>•	El cazador Rainn Delacourt descubre que Maisie y <span class="chrono-carnivore">Blue</span> (con Beta) están en la misma zona. Informa a Dodgson, quien ordena capturarlas porque su ADN es clave para perfeccionar los experimentos genéticos de BioSyn, incluida la manipulación de langostas.</p>
<p>•	Delacourt secuestra a Maisie y a Beta. Owen y Claire emprenden una búsqueda desesperada para rescatarlas, con ayuda de Franklin Webb.</p>
<p>•	Franklin informa a Owen y Claire que Barry Sembène se dirige a Malta para capturar a Soyona Santos, quien está en el mercado Amber Clave para concretar un trato con Delacourt.</p>
<p>•	Owen y Claire trabajan en Malta.</p>
<p>•	Los Cinco de <span class="chrono-island">Nublar</span>, junto a Barry y un <span class="chrono-herbivore">Kentrosaurus</span>, viajan en avión hacia Italia. El animal se descontrola y provoca un accidente. El avión se estrella, pero todos sobreviven.</p>
<p>•	Los jóvenes se refugian en casa de Gia, la novia de Ben, que vive con su abuela anti-dinosaurios. Mientras deciden su siguiente paso, el huevo eclosiona y nace la cría de <span class="chrono-herbivore">Bumpy</span>, llamada <span class="chrono-herbivore">Smoothie</span>.</p>
<p>•	Esa noche, un <span class="chrono-carnivore">Pyroraptor</span> ataca a los chicos en una plaza. La entrenadora de <span class="chrono-carnivore">Atrociraptors</span> aparece para capturarlo, usando a sus propios animales.</p>
<p>•	Al día siguiente, descubren que Brooklynn sigue viva mediante videollamada. El equipo se divide: Sammy y Kenji deciden regresar a EE.UU., dejando atrás a Brooklynn; Darius, Ben y Yaz deciden ayudarla. Esto rompe la relación entre Yaz y Sammy.</p>
<p>•	Darius, Ben y Yaz parten hacia Malta. Kenji y Sammy son llevados al aeropuerto por Gia, pero son atacados por el <span class="chrono-carnivore">Pyroraptor</span>, que escapa. Logran salvar a un pueblo y descubren que el animal se dirige al santuario de BioSyn.</p>
<p>•	En el trayecto encuentran una tableta de BioSyn con la lista de criaturas del santuario, incluida <span class="chrono-herbivore">Bumpy</span>. Deciden rescatarla.</p>
<p>•	Mientras tanto, Alan Grant y Ellie Sattler llegan al <span class="chrono-island">BioSyn Valley</span>, donde se reúnen con Malcolm, Lewis Dodgson y Ramsey Cole. Ramsey, actuando en secreto, les da acceso para infiltrar la instalación y obtener muestras de las langostas.</p>
<p>•	En Malta, Brooklynn conoce a un joven reportero infiltrado en Amber Clave, decidido a exponer la verdad. Se alía con él.</p>
<p>•	Soyona Santos se reúne con Delacourt para venderle sus cuatro <span class="chrono-carnivore">Atrociraptors</span>, dejando fuera a la entrenadora, que se esconde en el camión junto a Brooklynn.</p>
<p>•	Claire y Owen llegan a Malta y se reúnen con Barry, quien les muestra el mercado Amber Clave. Paralelamente, Darius, Ben y Yaz llegan buscando a Brooklynn. El reportero les informa sobre su ubicación.</p>
<p>•	Kayla Watts llega a Malta transportando a Beta con Rainn. En otro avión llega Maisie, ambas con destino al santuario.</p>
<p>•	Claire se cruza con Kayla en Amber Clave, donde se realizan peleas ilegales de dinosaurios. Claire pregunta por Maisie; Kayla finge no conocerla.</p>
<p>•	El operativo de Barry para capturar a Santos inicia, pero el camión con los <span class="chrono-carnivore">Atrociraptors</span> y Brooklynn choca. Santos ordena liberar a los raptores, escapa y se enfrenta a Claire, revelándole que Maisie ya fue enviada al santuario.</p>
<p>•	Claire es perseguida por un <span class="chrono-carnivore">Atrociraptor</span>. Owen se enfrenta a Rainn, quien libera a un <span class="chrono-carnivore">Allosaurus</span> (“<span class="chrono-carnivore">Killer Eye</span>”) y a un <span class="chrono-carnivore">Carnotaurus</span>. Rainn es devorado. Amber Clave colapsa. Darius, Yaz, Ben y el reportero sobreviven al caos.</p>
<p>•	Brooklynn y la entrenadora sobreviven al accidente. Santos regresa para revisar a sus animales y ordena que dos <span class="chrono-carnivore">Atrociraptors</span> persigan a Owen, quien escapa en moto.</p>
<p>•	Claire vuelve a cruzarse con Kayla. Esta vez Kayla la ayuda a huir del <span class="chrono-carnivore">Atrociraptor</span> y ambas escapan hacia su avión. Owen también logra llegar. Juntos parten hacia <span class="chrono-island">BioSyn Valley</span>.</p>
<p>•	Soyona y Brooklynn se enfrentan. La entrenadora aparece con sus <span class="chrono-carnivore">Atrociraptors</span>. Estalla una batalla entre los raptores. La entrenadora consigue el control de los cuatro, pero Soyona revela que controla a un <span class="chrono-carnivore">Carnotaurus</span>. La pelea culmina con la muerte de un <span class="chrono-carnivore">Atrociraptor</span> y de la entrenadora. Brooklynn traiciona a Soyona, pero antes de escapar es capturada por Barry con ayuda de Yaz y Ben.</p>
<p>•	Barry permite que los jóvenes viajen al santuario para detener a Dodgson.</p>
<p>•	Kenji y Sammy llegan al santuario, donde encuentran a Dodgson con un grupo de jóvenes que reciben a la <span class="chrono-carnivore">Tyrannosaurus</span> de <span class="chrono-island">Nublar</span>. Dodgson informa que posee un <span class="chrono-carnivore">Giganotosaurus</span>. Kenji intenta negociar la liberación de <span class="chrono-herbivore">Bumpy</span>. Bajo amenazas, Dodgson accede.</p>
<p>•	Darius, Ben, Yaz y Brooklynn llegan al santuario tras esquivar el ataque de un Quetzalcoatlus que los recibió de forma agresiva.</p>
<p>•	Ya dentro, se encuentran con Earnest, antiguo colega de Brooklynn de “Liberen a los Dinosaurios”. Él los ayuda a infiltrarse en la instalación, donde descubren el “<span class="chrono-project">Programa Terópodos Axis</span>”. Allí observan cómo entrenan a una nueva generación de <span class="chrono-carnivore">Atrociraptors</span> mejorados, que terminan matando a sus entrenadores.</p>
<p>•	Sammy y Kenji son engañados por Dodgson y abandonados en el santuario, donde son atacados por <span class="chrono-carnivore">Dilophosaurus</span>. Logran escapar.</p>
<p>•	Alan y Ellie obtienen la muestra de la langosta prehistórica.</p>
<p>•	Maisie y Beta escapan del laboratorio donde estaban retenidas por Dodgson y Wu. Maisie se encuentra con Alan y Ellie. Ramsey los guía por un sistema de transporte subterráneo.</p>
<p>•	Brooklynn descubre que el Dr. Wu trabaja en BioSyn cuando se encuentran cara a cara. Wu le pide ayuda, arrepentido del daño causado desde el primer dinosaurio que creó. Brooklynn confía en él. Wu le da información sobre sus archivos de respaldo, ubicados en bases ocultas en el valle. No puede acompañarlos porque debe encontrar a Maisie y a Beta.</p>
<p>•	Brooklynn, Yaz, Ben y Darius se adentran al valle, donde encuentran a Kenji y Sammy. Mientras buscan los archivos, son atacados por la <span class="chrono-carnivore">Tyrannosaurus</span>, Pachyrhinosaurus, <span class="chrono-carnivore">Giganotosaurus</span> y Quetzalcoatlus.</p>
<p>•	Dodgson, al descubrir la traición de Malcolm y que Alan y Ellie lo sabotean, corta la energía de los túneles. Los tres atraviesan cavernas donde encuentran Dimetrodones. Malcolm intenta rescatarlos.</p>
<p>•	El avión de Kayla es atacado por un Quetzalcoatlus. Claire cae en paracaídas, es acosada por un Therizinosaurus y sobrevive. Kayla y Owen sobreviven al choque y se enfrentan al <span class="chrono-carnivore">Pyroraptor</span> que llegó al santuario. Huyen en busca de Claire.</p>
<p>•	Owen y Kayla encuentran a la <span class="chrono-carnivore">Tyrannosaurus</span> de <span class="chrono-island">Nublar</span>, que compite por territorio con el <span class="chrono-carnivore">Giganotosaurus</span>.</p>
<p>•	Los Seis de <span class="chrono-island">Nublar</span> encuentran los archivos de Wu y, tras destruirlos, deciden buscar a <span class="chrono-herbivore">Bumpy</span> para sacarla del valle y reunírsela con <span class="chrono-herbivore">Smoothie</span>.</p>
<p>•	Son atacados por varias criaturas, pero un <span class="chrono-herbivore">Stegosaurus</span> hiere gravemente a Ben.</p>
<p>•	Claire llega a una plataforma de investigación, pero es rodeada por <span class="chrono-carnivore">Dilophosaurus</span>. Owen y Kayla la rescatan.</p>
<p>•	Alan, Ellie y Maisie son rescatados por Malcolm.</p>
<p>•	Dodgson, al ver su plan arruinado, quema las langostas, pero estas escapan y provocan el incendio del valle.</p>
<p>•	Darius y el grupo intentan llevar a Ben a la enfermería para retirar el pedazo de thagomizer incrustado en su abdomen. También es el lugar donde se encuentra <span class="chrono-herbivore">Bumpy</span>. Pero las llamas los obligan a huir entre dinosaurios desesperados, incluido el Therizinosaurus. Al llegar a la enfermería logran liberar a <span class="chrono-herbivore">Bumpy</span> y estabilizar a Ben.</p>
<p>•	Dodgson activa los chips de control (diseño de Daniel Kon) implantados en los dinosaurios. Todos los animales son dirigidos al centro del santuario.</p>
<p>•	En medio del incendio, el grupo principal sufre un accidente vehicular. Owen, Claire y Kayla los encuentran y todos se reúnen.</p>
<p>•	Intentan llegar al centro de mando, pero el <span class="chrono-carnivore">Giganotosaurus</span> los ataca. Se refugian en la plataforma.</p>
<p>•	Kayla busca transporte aéreo. Ramsey confronta a Dodgson y lo abandona antes de unirse al grupo.</p>
<p>•	Se dividen las tareas:
Alan, Owen y Maisie rescatan a Beta.
Claire y Ellie desactivan los suministros eléctricos para escapar.
Malcolm y Ramsey los guían desde la torre.</p>
<p>•	El grupo de los Seis de <span class="chrono-island">Nublar</span> también se divide. Sammy y Yaz se encargan de llevar a <span class="chrono-herbivore">Bumpy</span> y a <span class="chrono-herbivore">Smoothie</span> con los demás dinosaurios; Darius y Brooklynn buscan una salida por los ductos del Super Loop; Kenji cuida a Ben. Todo marcha bien hasta que Kenji es atacado por <span class="chrono-carnivore">Dilophosaurus</span>. Los animales persiguen a Ben y Kenji hasta la entrada de los ductos. Ambos logran escapar.</p>
<p>•	Dodgson intenta huir en un Super Loop, pero es asesinado por los <span class="chrono-carnivore">Dilophosaurus</span>.</p>
<p>•	El grupo de Claire rescata al Dr. Henry Wu, quien se había quedado atrás.</p>
<p>•	Antes de escapar, ocurre la batalla final: el <span class="chrono-carnivore">Giganotosaurus</span> se enfrenta a la <span class="chrono-carnivore">Tyrannosaurus Rex</span> y al Therizinosaurus. El <span class="chrono-carnivore">Giganotosaurus</span> es derrotado.</p>
<p>•	Todos escapan en el helicóptero que encuentra Kayla.</p>
<p>•	Sammy y Yaz logran salvar a <span class="chrono-herbivore">Bumpy</span> y a <span class="chrono-herbivore">Smoothie</span>, y encuentran a la pareja de <span class="chrono-herbivore">Bumpy</span>, padre de <span class="chrono-herbivore">Smoothie</span>. Ambas se reúnen con Brooklynn y Darius, y luego con Kenji y Ben. Pero al escapar, ven cómo el único helicóptero disponible se aleja, sin saber que allí viajan Grant, Sattler, Malcolm, Grady, Dearing, Maisie, Ramsey y Kayla.</p>
<p>•	El grupo se esconde entre los escombros. Ben, gravemente herido, empeora cada segundo. Buscan otra alternativa: usar el vehículo de Gia en el que llegaron Kenji y Sammy. El grupo se divide: unos cuidan a Ben y otros van por el auto. Cuando logran traerlo, son rodeados por <span class="chrono-carnivore">Atrociraptors</span>.</p>
<p>•	En el momento crítico, la <span class="chrono-carnivore">Tyrannosaurus</span> deambula por el área y ataca a los <span class="chrono-carnivore">Atrociraptors</span>, pero se ve superada en número. Brooklynn abre una compuerta de la que emergen la pareja de <span class="chrono-carnivore">Tyrannosaurus</span> que causaron estragos en 1997. Los tres animales logran ahuyentar a los <span class="chrono-carnivore">Atrociraptors</span>. El grupo aprovecha para escapar.</p>
<p>•	Al día siguiente, Ben es llevado a urgencias acompañado por Kenji. El resto ayuda en la recuperación de los dinosaurios del santuario.</p>
<p>•	Claire, Owen y Maisie regresan a su vida cotidiana como familia.</p>
<p>•	Alan Grant y Ellie Sattler finalmente inician una relación formal.</p>
<p>•	Ian Malcolm, Alan y Ellie testifican públicamente sobre lo ocurrido en <span class="chrono-island">BioSyn Valley</span>.</p>
<p>•	El Santuario de BioSyn es abandonado y su reputación queda destruida.</p>
<p>•	Un mes después, la familia de Brooklynn ayuda a reconstruir el santuario. Darius es uno de los encargados del bienestar de las criaturas alojadas allí. Sammy y Yaz ayudan al Dr. Henry Wu a eliminar la plaga de langostas con ayuda de las muestras de ADN de Maisie y Beta. Ben es dado de alta tras haber sido resucitado y recibe el apoyo de su novia Gia. Los Seis de <span class="chrono-island">Nublar</span> se reúnen con frecuencia en la casa de Darius.</p>`
  },
  {
    year: "2027",
    title: "Renacer",
    severity: "normal",
    content: `<p>• Los dinosaurios comienzan a extinguirse de forma gradual. Científicos determinan que muchos no logran adaptarse a los climas actuales fuera de su bioma original, sufriendo colapsos genéticos o infecciones. Gobiernos y organizaciones ambientales comienzan a reubicar a los sobrevivientes en islas ecuatoriales.</p>
<p>• La farmacéutica Parker-Genix anuncia un proyecto para curar enfermedades cardíacas mediante ingeniería genética. Martin Krebs contacta al Dr. Henry Loomis (discípulo de Alan Grant), quien confirma que el ADN de <span class="chrono-herbivore">Titanosaurus</span>, Quetzalcoatlus y <span class="chrono-carnivore">Mosasaurus</span> de la Isla Hubert contiene enzimas únicas para la regeneración del miocardio.</p>
<p>• Se organiza una expedición secreta con Zora Bennett (especialista militar) y su equipo (Duncan Kincaid, LeClerc, Nina y Bobbie). En el trayecto, rescatan a la familia Delgado (Reuben, Teresa, Isabella y Xavier) tras un ataque de <span class="chrono-carnivore">Mosasaurus</span> y <span class="chrono-carnivore">Spinosaurus</span> que hunde su velero. Nina y Bobbie mueren, pero Zora obtiene la muestra del <span class="chrono-carnivore">Mosasaurus</span>.</p>
<p>• En la isla, el equipo extrae ADN de una manada de <span class="chrono-herbivore">Titanosaurus</span>. La familia Delgado se separa temporalmente y sobrevive a un encuentro con "<span class="chrono-carnivore">Ember</span>", un <span class="chrono-carnivore">Tyrannosaurus Rex</span> territorial. Posteriormente, en un nido de Quetzalcoatlus, logran extraer ADN de un huevo, pero LeClerc es devorado por la madre.</p>
<p>• El grupo se reúne en una vieja estación de combustible, donde son atacados por <span class="chrono-hybrid">Mutadons</span>. Finalmente, el <span class="chrono-hybrid">Distortus Rex</span> destruye el helicóptero de extracción y devora a Krebs. Los sobrevivientes huyen por túneles para llegar a un bote, donde escapan y deciden hacer pública la investigación para que beneficie a toda la humanidad, rompiendo el monopolio de Parker-Genix.</p>`
  }
];
