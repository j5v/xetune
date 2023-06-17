// xetune: tuning analyser
// (c) John Valentine, 2023.
// intent: MIT licence.
app = () => {

  const env = { // Environment config
    devBuild: true,
    omitLogo: true, // change/remove if taken into the Surge project.
    debug: { // true = show debug messages in the console.``
      general: true
    }
  }

  const ref = { // Reference data
    title: 'XeTune',
    version: '2023.06.031', // YYYY.MM.<release version> - increment for each release, after changes to code, data, or documentation.
    logo: '', // TODO: logo design?
    uiStrings: {
      featureNotAvailable: 'This feature is not yet available',
      configure: 'Configure',
      clearStorage: 'Clear storage',
      confirmClearStorage: 'Reset app configuration?',
      saveTo: 'Save to',
      exportComment: 'Exported by XeTune',
      modalCloseButton: '&times',
      referenceScale: 'Reference scale',
      removeTuning: 'Remove tuning',
      downloadTuning: 'Download tuning',
      addTuning: 'Add tuning',
      duplicateTuning: 'Duplicate tuning',
      tuningProperties: 'Tuning properties',
      removeSelectedTuningNotes: 'Remove selected notes',
      addTuningNote: 'Add a note',
      selectAllTuningNotes: 'Select all notes',
      unselectAllTuningNotes: 'Unselect all notes',
      limit: 'limit',
      ed: 'ED',
      save: 'Save',
    },
    supportedPrimes: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89],
    localStorageKeys: {
      appRoot: 'XeTune-',
      appConfig: 'appConfig',
      view: 'view'
    },
    buttons: {
      REMOVE: 1,
      ADD: 2
    },
    analysisModes: {
      // TUNINGS: 1,
      NOTES: 2,
      NOTE_PROPERTIES: 3
    },
    scaleViewIcons: [
      { label: '1', hint: '1 octave', minOctave: 0, maxOctave: 1 },
      { label: '3&times;', hint: '3rd harmonic', minOctave: 0, maxOctave: Math.log(3) / Math.log(2) },
      { label: '2', hint: '2 octaves', minOctave: 0, maxOctave: 2 },
      { label: '3', hint: '3 octaves', minOctave: 0, maxOctave: 3 },
      { label: '1,3', hint: '1 suboctave, 3 octaves', minOctave: -1, maxOctave: 3 },
    ],
    scaleViewLabels: [
      { enum: 0, label: 'Hz', min: frequencyOffset({relative: -9}), max: frequencyOffset({relative: 3}) },
      { enum: 1, label: 'Octave', min: 0, max: 1 },
      { enum: 2, label: 'ET12 Cents', min: 0, max: 1200 },
    ],
    tuningScales: {
      LINEAR: 1,
      EXPONENTIAL: 2,
      IMPORT_SCL: 3,
      FROM_NOTES: 4
    },
    noteNamesET12: [ 'C', 'C&sharp;', 'D', 'E&flat;', 'E', 'F', 'F&sharp;', 'G', 'A&flat;', 'A', 'B&flat;', 'B' ],
    leastHarmonicLevel:10,
    noteNamesHarmonic: { // read this like a hashed dictionary, using the key
      // level: 1 = show always; undefined = omit if crowded or to simplify
      // TODO: accessible typesetting of label in: title attribute, SVG, and HTML.
      // Data from (1) Surge XT tunings, (2) https://en.xen.wiki/w/Gallery_of_just_intervals
      // Data here is mostly to 11-limit.
      '1/1': { hint: 'unison, perfect prime', label: 'P', level: 3 },
      '2/1': { hint: '1 octave', label: 'O1', level: 1 },
      '3/1': { hint: 'third harmonic, tritave', label: 'P12', level: 1 },
      '4/1': { hint: '2 octaves, fourth harmonic', label: 'O2', level: 1 },
      '5/1': { hint: 'fifth harmonic, pentave', label: `M17${superDigits(5)}`, level: 2 },
      '6/1': { hint: 'sixth harmonic', label: 'P19', level: 2 },
      '7/1': { hint: 'seventh harmonic', label: `m21${superDigits(7)}`, level: 2 },
      '8/1': { hint: '3 octaves, eighth harmonic', label: 'O3', level: 1 },
      '3/2': { hint: 'perfect fifth', label: 'P5', level: 1 },
      '5/2': { hint: 'just major tenth', label: `M10${superDigits(5)}`, level: 2 },
      '4/3': { hint: 'perfect fourth', label: 'P4', level: 1 },
      '5/3': { hint: 'major sixth', label: 'M6', level: 4 },
      '7/3': { hint: 'septimal minor tenth', label: 'm10${superDigits(7)}', level: 4 },
      '5/4': { hint: 'classic major third, just major third, octave-reduced 5th harmonic', label: `M3${superDigits(5)}`, level: 3 },
      '7/4': { hint: 'subminor seventh, septimal minor seventh, harmonic seventh, natural seventh', label: `M7${superDigits(7)}` },
      '6/5': { hint: 'minor third', label: 'm3' },
      '7/5': { hint: 'augmented fourth, septimal tritone', label: `d5${superDigits(7)}${subDigits(5)}` },
      '8/5': { hint: 'minor sixth', label: `m6${subDigits(5)}`, level: 2 },
      '9/5': { hint: 'classic minor seventh, large minor seventh', label: `m7${subDigits(5)}` },
      '7/6': { hint: 'subminor third, septimal minor third', label: `m3${superDigits(7)}` },
      '11/6': { hint: 'undecimal neutral seventh, 21/4-tone', label: `m7${superDigits(11)}` },
      '8/7': { hint: 'septimal whole tone', label: `M2${subDigits(7)}` },
      '9/7': { hint: 'septimal major third', label: `M3${subDigits(7)}` },
      '10/7': { hint: "diminished fifth, Euler's tritone, superaugmented fourth", label: `A4${superDigits(5)}${subDigits(7)}` },
      '11/7': { hint: "undecimal subminor sixth, undecimal augmented fifth", label: `P5${superDigits(11)}${subDigits(7)}` },
      '9/8': { hint: 'Pythagorean whole tone, major whole tone', label: `M2` },
      '11/8': { hint: 'super-fourth, undecimal semi-augmented fourth', label: `P4${superDigits(11)}}` },
      '11/9': { hint: 'undecimal neutral third', label: `m3${superDigits(11)}` },
      '10/9': { hint: 'minor whole tone', label: `M2${superDigits(5)}` },
      '11/10': { hint: "4/5-tone, Ptolemy's second", label: `m2${superDigits(11)}${subDigits(5)}` }
     }
  }

  const config = { // Serializable
    reference: { // TODO: serializable to .enum.
      scaleLabel: ref.scaleViewLabels[2],
    },
    noteShowSubtleLinesBelowLevel: 5,
    noteShowLabelsBelowLevel: 3,
    noteRefHz: 440 * (Math.pow(2, -9/12)), // C, around 261 Hz // TODO: split to be configurable
    nearEnoughCents: 8, // for letter labels of notes
    harmonicImportLabelLimit: 99, // TODO: make this the concern of the renderer, not the importer.
    harmonicAnalysisIntegerLimit: 89, // TODO: use limits properly
    harmonicAnalysisSignificanceLimit: 1,
    precisionRefHz: 2,
    precisionRefHzHint: 7,
    precisionDiffHz: 1,
    precisionDiffHzHint: 7,
    precisionDiffCents: 2,
    precisionDiffCentsHint: 7,
    hci: {
      displayWidth: 14 // inches.
    },
    tunings: []
  }

  const uiState = { // Temporary UI state
    showConfig: false,
    showHelp: false,
    activeAnalysis: ref.analysisModes.NOTES,
    addTuningScaleType: 2, // ED
    addTuningBase: 2, // EDO
    scaleView: {

    }
  }

  const api = { // Dynamic state. Don't serialize
  }

  const s /* alias */ = textStyle = { // SVG text styles
    bodySize: 24, // px todo: get from browser default
    bodyRatio: 0.5, // width, as a factor of height
    pageMargin: {
      top: 1.5,
      right: 1,
      bottom: 1,
      left: 1
    }
  }

  const g /* alias */ = geometry = { // Current display rendering geometry
    resizeDirty: false,
    // see resizeAppViewport() for pageMargin{ top, right, bottom, left }
  }

  // === Setup
  function init() {
    loadConfigFromStorage();
    addEventHandlers();
    initAnalysis();
    if (config.tunings.length == 0) addTunings(); // demo tunings, as a starting point.
    resizeAppViewport(); // calls renderApp()
  }
  function initAnalysis() {
    ref.harmonicRatios = harmonicRatiosToNumber({ limit: config.harmonicAnalysisIntegerLimit }); // cache
  }

  // === Utils
  const getElement = (id) => ( document.getElementById(id) );
  const setContent = (id, content) => { getElement(id).innerHTML = content }
  const log = console.log;
  const logInfo = console.info;
  const logError = console.error;
  const addEventHandlers = () => {
    window.addEventListener('resize', debouncedResize);
    window.addEventListener('contextmenu', function(e) { e.preventDefault() } );

    window.addEventListener('drop', dropHandler);
    window.addEventListener('dragover', dragOverHandler);
  }
  const randomBetween = (lower, upper) => (
    Math.floor(lower + Math.random() * (upper - lower))
  )
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const dp = (n) => Math.floor(n * 10) * 0.1;
  const escapeHTML = (html) => (new Option(html).innerHTML); // TODO: check if this is safely disposed.
  function subDigits(n) {
    return n.toString().split('').map((digit) => '&#x208' + digit + ';').join('');
  } // HTMLEntity
  function superDigits(n) {
    // This is a poor compromise decision. It *looks* right in HTML, SVG and title hints, but...
    // TODO: check whether this sounds good in a screenreader, and is otherwise fully accessible.
    return n.toString().split('').map((digit) => {
      const digitAsNumber = parseInt(digit, 10);
      const nonseqChar = [ '&#x2070', '&#xb9', '&#xb2', '&#xb3'];
      return (digitAsNumber >= 1 && digitAsNumber <= 3) ? nonseqChar[digitAsNumber] : ('&#x207' + digit) + ';';
    }).join('');
  } // HTMLEntity
  const debounce = (func, wait, immediate) => {
    // source: underscore.js and https://davidwalsh.name/javascript-debounce-function
  	var timeout;
  	return function() {
  		var context = this, args = arguments;
  		var later = function() {
  			timeout = null;
  			if (!immediate) func.apply(context, args);
  		}
  		var callNow = immediate && !timeout;
  		clearTimeout(timeout);
  		timeout = setTimeout(later, wait);
  		if (callNow) func.apply(context, args);
  	}
  }
  const debouncedResize = debounce(
        resizeAppViewport,
      ref.debounceInterval
  );
  const copyObject = (source) => { // shallow, keys
    let objectCopy = {};
    let key;
    for (key in source) {
      objectCopy[key] = source[key];
    }
    return objectCopy;
  }
  const cloneObject = (source) => { // deep, not functions
    if (env.debug.objects) {
      log('cloneOject()', source);
      log(JSON.stringify(source));
    }
    return JSON.parse(JSON.stringify(source));
  };  

  // === Storage
  // Storage persistence
  function loadFromStorage(key) {
    const storedData = localStorage.getItem(ref.localStorageKeys.appRoot + key)
    if (env.debug.localStorage)
      log({ fn: 'loadFromStorage', key, storedData }) // ###
    if (storedData) {
      return JSON.parse(storedData)
    }
  }
  function saveToStorage(key, value) {
    const storedData = localStorage.setItem(ref.localStorageKeys.appRoot + key, value)
    if (env.debug.localStorage)
      log({ fn: 'saveToStorage', key, value }) // ###
    if (storedData) {
      return JSON.parse(storedData)
    }
  }
  function clearLocalStorage() {
    [
      ref.localStorageKeys.layouts,
      ref.localStorageKeys.currentLayout,
      ref.localStorageKeys.appConfig
    ].map((i) => { localStorage.removeItem(ref.localStorageKeys.appRoot + i) })
  }

  // Storage callers: config
  function saveAppConfiguration() {
    Object.assign(config, JSON.parse(getElement('app-json-config').value))
    saveConfigToStorage()
    renderApp()
  }
  function loadConfigFromStorage() {
    const configPayload = loadFromStorage(ref.localStorageKeys.appConfig)
    if (configPayload && configPayload !== '') {
      Object.assign(config, configPayload)
    }
  }
  function saveConfigToStorage() {
    saveToStorage(ref.localStorageKeys.appConfig, JSON.stringify(config))
  }

  // Drag and drop
  function dragOverHandler(ev) {
    ev.preventDefault();
  }  
  function dropHandler(ev) {
    ev.preventDefault();
  
    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      [...ev.dataTransfer.items].forEach((item, i) => {
        // only process files
        if (item.kind === "file") {
          startImportTuning(item.getAsFile());
        }
      });
    } else {
      // Use DataTransfer interface to access the file(s)
      [...ev.dataTransfer.files].forEach((file, i) => {
        startImportTuning(item.getAsFile());
      });
    }
  }
  function startImportTuning(f) {
    if (f.name && f.name.slice(-4).toLowerCase() === '.scl') {
      const reader = new FileReader();

      reader.addEventListener(
        "load",
        () => {
          // this will then display a text file
          importTuning(reader.result, f.name);
        },
        false
      );
    
      reader.readAsText(f);
    }
  }
  function importTuning(s, filename) {
    // split lines on LF, strip extra CRs, trim extra whitespace.
    const linesWithComments = s.split('\n').map(s => s.replace(/"\r"/g,"").trim());

    // Remove comment lines and empty lines
    const lines = linesWithComments.filter(i => (i.charAt(0) != '!') && (i.length != 0));
    const description = lines[0];
    // const items = parseInt(lines[1]); // might not be required.
    lines.splice(0, 2);

    addTuning({ scaleType: ref.tuningScales.IMPORT_SCL, lines, description, filename });
    renderApp();
  }

  // Download
  function download(text, filename) {
    const blobx = new Blob([text], { type: 'text/plain' });
    const elemx = window.document.createElement('a');
    elemx.href = window.URL.createObjectURL(blobx);
    elemx.download = filename;
    elemx.style.display = 'none';
    document.body.appendChild(elemx);
    elemx.click();
    document.body.removeChild(elemx);
  }

  // === Tuning methods
  function addTunings() {
    addTuning({ scaleType: ref.tuningScales.LINEAR, limit: 9 });
    addTuning({ scaleType: ref.tuningScales.EXPONENTIAL, divisions: 12 });
    // addTuning({ scaleType: ref.tuningScales.EXPONENTIAL, divisions: 13, base: 3 });
    // addTuning({ scaleType: ref.tuningScales.EXPONENTIAL, divisions: 31 });
  }
  function addTuning(tuning) {

    // Unique ID
    if (!config.nextTuningId) {
      config.nextTuningId = 0
    }
    tuning.id = config.nextTuningId++
    
    // Label
    if (!tuning.label) { // create a default label
      if (tuning.scaleType == ref.tuningScales.FROM_NOTES)
        tuning.label = `Free-${tuning.id}`;
      if (tuning.scaleType == ref.tuningScales.IMPORT_SCL)
        tuning.label = `${tuning.id}`;
      if (tuning.scaleType == ref.tuningScales.LINEAR)
        tuning.label = `${tuning.limit}-${ref.uiStrings.limit}`;
      if (tuning.scaleType == ref.tuningScales.EXPONENTIAL)
        tuning.label = `${tuning.divisions}-${ref.uiStrings.ed}${tuning.base || 2}`; // default: assume 2x freq for repeat
    }

    tuning.selected = true;

    expandTuning(tuning);

    if (tuning.isolated) {
      return tuning;
    } else {
      config.tunings.push(tuning);
    }
  }
  function expandTuning(tuning) {

    tuning.notes = [];
    const refHz = config.noteRefHz;

    // TODO: optimize: consider composed variants, to eliminate switched calling
    if (tuning.scaleType == ref.tuningScales.IMPORT_SCL) {
      expandTuningFromImport();
    } else if (tuning.scaleType == ref.tuningScales.FROM_NOTES) {
      expandTuningFromNotes();
    } else if (tuning.scaleType == ref.tuningScales.EXPONENTIAL) {
      expandTuningED();
    } else if (tuning.scaleType == ref.tuningScales.LINEAR) {
      expandTuningRatios();
    }

    function expandTuningFromImport() {

      // First note is always degree 0, ratio 1, at reference frequency.
      tuning.notes = [ {
        frequency: config.noteRefHz,
        isRatio: true,
        n: 1,
        m: 1,
        ratio: 1,
        octaves: 1,
        octave: 0,
        centsET12: 0,
        label: '1/1',
        label2: 'P',
        level: 1
      } ];

      let noteNumber = 1;

      tuning.lines.forEach(line => {
        if (line.indexOf('/') > -1) {
          // Line is a ratio
          const nm = line.split('/').map(s => s.trim());
          const n = parseInt(nm[0], 10);
          const m = parseInt(nm[1], 10);
          const ratio = n / ( m || 1 ); // avoids exception
          const key = line;

          const noteNameHarmonic = ref.noteNamesHarmonic[key];
          let level, label2, hint, label;
          if (noteNameHarmonic) {
            label2 = noteNameHarmonic.label
            hint = noteNameHarmonic.hint
            level = noteNameHarmonic.level
          }
          if (n > config.harmonicImportLabelLimit || m > config.harmonicImportLabelLimit) {
            // Large ratio numbers don't display well, so just use the note number.
            // This might cause problems if notes are later inserted. Workaround: export then re-import.
            label = noteNumber;
          }
         
          const frequency = config.noteRefHz * ratio;
          const octaves = Math.log(frequency / config.noteRefHz) / Math.log(2);
          tuning.notes.push({
            n, m, ratio, frequency, octaves, hint, label2, level,
            label: label || key || noteNumber,
            defined: true, // imported notes are 'defined'
            isRatio: true,
            octave: Math.floor(octaves),
            centsET12: 1200 * octaves,
            repeatEnd: noteNumber == tuning.lines.length // mark last degree (this might not be a valid assumption)
          });

        } else {
          // Line is a value in 12-EDO cents
          const centsET12 = parseFloat(line);
          const frequency = frequencyOffset({ f: config.noteRefHz, relative: centsET12 * 0.01 });
          tuning.notes.push({
            frequency,
            ratio: frequency / config.noteRefHz,
            octaves: centsET12 / 1200,
            octave: Math.floor(centsET12 / 1200),
            defined: true, // imported notes are 'defined'
            centsET12,
            repeatEnd: noteNumber == tuning.lines.length // mark last degree
          });          
        }

        noteNumber++;
      });

      tuning.hint = tuning.name;
      tuning.label += (tuning.filename != '') ? `: ${tuning.filename}` : '';
      
      // Sort by frequency
      tuning.notes.sort((a, b) => (a.frequency - b.frequency));

      // Renumber notes/degrees
      let j = 0;
      tuning.notes.forEach(note => note.number = j++);
    }
    function expandTuningFromNotes() {
      // copy selected notes from all other selected tunings
      tuning.notes = [];

      let f;
      config.tunings.filter(tuning => tuning.selected).forEach(sourceTuning => {
        if (!f) { // copy .exportOnlyRange from first selected tuning
          f = true;
          tuning.exportOnlyRange = sourceTuning.exportOnlyRange;
          tuning.base = sourceTuning.base;
        }
        sourceTuning.notes.filter(note => note.selected).forEach(note => {
          tuning.notes.push(copyObject(note)); // don't just copy a reference to the old note.
        })
      })

      // Sort by frequency
      tuning.notes.sort((a, b) => (a.frequency - b.frequency));

      // Select only the new tuning.
      config.tunings.forEach(t => {t.selected = false});
      tuning.selected = true;

      // Renumber notes/degrees
      let j = 0;
      tuning.notes.forEach(note => note.number = j++);
    }
    function expandTuningED() {
      const base = tuning.base || 2;
      const logSpaceFactor =  Math.log(base) / Math.log(2);
      const min = Math.floor(tuning.divisions * -1 * logSpaceFactor);
      const max = Math.ceil(tuning.divisions * 3 * logSpaceFactor);
      tuning.exportOnlyRange = true;

      for (let i = min; i <= max; i++) {
        const frequency = frequencyOffset({ f: refHz, relative: i, divisions: tuning.divisions, base: tuning.base });
        const centsET12 = logSpaceFactor * 1200 * (i / tuning.divisions);
        const label2 = findNoteName(centsET12 % 1200);

        tuning.notes.push({
          number: i,
          defined: (i > 0 && i <= tuning.divisions), // for export
          octave: Math.floor(i / tuning.divisions),
          label: undefined,
          label2,
          frequency,
          octaves: logSpaceFactor * (i / tuning.divisions),
          centsET12: logSpaceFactor * 1200 * (i / tuning.divisions),
          ratio: frequency / refHz,
        });
        
      }
    }    
    function expandTuningRatios() {
      const ratios = harmonicRatiosToNumber({ limit: tuning.limit });
      let noteNumber = 0;
      ratios.sort((a, b) => a.ratio - b.ratio);
      ratios.map((ratioSpec) => {
        const frequency = config.noteRefHz * ratioSpec.ratio
        const octaves = Math.log(frequency / config.noteRefHz) / Math.log(2)

        // labels from dictionary
        let label2
        let hint
        let level = ref.leastHarmonicLevel // prominence/detail level
        const key = `${ratioSpec.n}/${ratioSpec.m}`
        const noteNameHarmonic = ref.noteNamesHarmonic[key];
        if (noteNameHarmonic) {
          label2 = noteNameHarmonic.label
          hint = noteNameHarmonic.hint
          level = noteNameHarmonic.level
        }

        tuning.notes.push({
          number: noteNumber++,
          defined: true,
          ratio: ratioSpec.ratio,
          n: ratioSpec.n,
          m: ratioSpec.m,
          isRatio: true,
          frequency,
          octave: Math.floor(octaves),
          hint,
          label: key,
          label2,
          level,
          octaves,
          centsET12: 1200 * octaves,
        })
      })
    }

  }
  function harmonicRatiosToNumber({ limit }) {
    const ratios = [];
    const findRatio = (ratio) => ratios.find(i => (ratio == i.ratio));
    for (let n = 1; n <= limit; n++) {
      for (let m = 1; m <= limit; m++) {
        let ratio = n / m;
        if (findRatio(ratio) == undefined) { // TODO: check for FP precision
          ratios.push({
            ratio: n / m,
            n: n,
            m: m
          })
        }
      }
    }
    return ratios;
  }
  function frequencyOffset({ f = 440, relative = 0, divisions = 12, base = 2 }) {
    return f * (Math.pow(base, relative / divisions))
  }
  function frequenciesToCentsInterval(f1, f2) {
    return Math.log2(f2 / f1) * 1200;
  }
  function findNoteName(centsET12) {
    const noteInOctave = ((centsET12 + 1200) % 1200) * 0.01;
    let maxDistance;
    let foundNoteName;
    for (let i = 0; i < ref.noteNamesET12.length; i++) {
      let distance = noteInOctave - i;
      if (maxDistance == undefined || Math.abs(distance) < Math.abs(maxDistance)) {
        maxDistance = distance;
        foundNoteName = ref.noteNamesET12[i];
      }
    }
    if (Math.abs(maxDistance) <= (config.nearEnoughCents * 0.01)) {
      return foundNoteName;
    }
  }
  function noteDisplayName({tuning, note}) {
    let noteName = '';
    if (note) {
      noteName =
        note.label ||        
        note.label2 ||
        (note.hint == undefined ? note.number : `'${note.hint}'`)
      };
    return noteName; // ## TODO: x placeholder
  }
  function notesForExportAsSCL(tuning) {
    const comment = '! ';
    const t = [];
    t.push(`${comment}${tuning.label || ''}`);
    t.push(`${comment}${ref.uiStrings.exportComment}`);
    
    // write not count
    const notesToExport = tuning.notes.filter(n => (
      n.ratio > 1 && // by convention, no subharmonics
      (tuning.base == undefined || n.ratio <= tuning.base) && // export only a useful repeating range
      (n.defined || n.isRatio)
    ));
    const length = notesToExport.length;
    t.push((tuning.description || '').replace(/\n/g, ". ")); // Description is limited to a single string/line. Might result in "..".
    t.push(length);
    t.push(`${comment}`); // Convention is to separate the count from the list of notes

    // write notes
    notesToExport.forEach(n => {
      if (n.isRatio) {
        t.push(` ${n.n}/${n.m}`);
      } else {
        const isWholeNumber = (n.centsET12 == Math.ceil(n.centsET12));
        t.push(` ${isWholeNumber ? n.centsET12 + '.0' : n.centsET12 }`);
      }
    });

    return t.join("\n"); // TODO: write full export text
  }
  function harmonicsToLimit({ limit = 5, maxExponent = 3 }) {
    const primes = primesToLimit(limit);
    const dimensionCount = primes.length;

    const dimensions = []; // Working area for combinatorial processing
    const ratios = []; // Push results here

    generatePrimePowers();
    if (env.debug.general) log('dimensions:', dimensions);

    let combinationCount = dimensions.reduce( // works for nonuniform [].max
      (accumulator, currentValue) => (accumulator * (currentValue.max + 1)),
      1
    );
    if (env.debug.general) log(
      'n or m combinationCount:', combinationCount,
      '(n, m) combinationCount:', combinationCount * combinationCount
    );

    let k = 0;
    while (k < combinationCount * combinationCount) {
      addRatio(); // Calculate and store n, m, ratio

      // if (env.debug.general) log({ // all counters
      //   di: dimensions.map(d => d.i).toString(), 
      //   dj: dimensions.map(d => d.j).toString()
      // });

      inc(0, 0); // Increment the least-significant counter index (with recursive cascade of carry-over)
          
      k++;
    }

    if (env.debug.general) log(ratios);

    return ratios;

    function generatePrimePowers() {
      primes.forEach(p => {
        // cache the powers of primes
        let exponent = 0
        const powers = []
        for (let k = 0; k <= maxExponent; k++) {
          powers.push(Math.pow(p, k))
        }

        dimensions.push({
          prime: p,
          max: maxExponent,
          i: 0,
          j: 0,
          powers
        })

      })
    }

    function primesToLimit(limitP) {
      const foundIndex = ref.supportedPrimes.indexOf(limitP);
      if (foundIndex > -1) {
        return ref.supportedPrimes.slice(0, foundIndex + 1);
      }
    }

    function inc(set, dimension) { // recursive, for cascading counter carry-over.
      // set 0 uses i counters; set 1 uses j counters

      if (set == 0) { // set i
        dimensions[dimension].i++;
        if (dimensions[dimension].i > dimensions[dimension].max) { // Increment next index
          // Maintain counters
          dimensions[dimension].i = 0;
          dimension++;
          if (dimension >= dimensionCount) {
            inc(1, 0); // Increment j
          } else {
            inc(set, dimension); // Increment next dimension counter in i
          }
          dimension = 0;
        }
      } else { // Set == 1 (set j). Code is almost identical to the above.
        dimensions[dimension].j++;
        if (dimensions[dimension].j > dimensions[dimension].max) { // Increment next index
          // Maintain counters
          dimensions[dimension].j = 0;
          dimension++;
          if (dimension >= dimensionCount) {
            // we've reached the end. No action needed
          } else {
            inc(set, dimension); // Increment next dimension counter in i
          }
          dimension = 0;
        }
      }
    }

    function addRatio() { // reads dimensions[], stores a new object in ratios[]
      // n = product of (prime ^ i) for each dimension.
      // m = product of (prime ^ j) for each dimension.
      const n = dimensions.reduce(
        (product, dimension) => (product * (dimension.powers[dimension.i])),
        1
      );
      const m = dimensions.reduce(
        (product, dimension) => (product * (dimension.powers[dimension.j])),
        1
      );
      const ratio = n / m;

      // TODO: filter for criteria, e.g. bounds or oddness for n or m.

      // TODO: check if we already have the ratio, and use the simplest.

      // store
      ratios.push({ n, m, ratio });
    }

  }

  // === UI Methods
  function toggleHelp() {
    uiState.showHelp = !uiState.showHelp
    renderApp()
  }
  function showAppConfig() {
    const modalContent = `
      <div class="modal-content config-edit">

        ${modalHeader(ref.uiStrings.configure + ' ' + ref.title)}

        <div class="modal-row">
          <button onclick="if (window.confirm('${ref.uiStrings.confirmClearStorage}')) { ui.clearLocalStorage(); ui.renderApp(); }";>${ref.uiStrings.clearStorage}</button>
        </div>

        <hr>

        <div class="modal-row">
          <label for="app-json-config">JSON configuration</label>
          <textarea id="app-json-config" multiline>${JSON.stringify(config, null, 2)}</textarea>
        </div>
        <div class="modal-row">
          <button onclick="ui.saveAppConfiguration()">Save JSON configuration</button>
        </div>

      </div>
    `

    showModal(modalContent);
  }
  function scaleViewZoom({ minOctave = 0, maxOctave = 1 }) {
    // todo: adapt to changing scale view types
    // todo: make this a config item, rather than mutating ref data!
    config.reference.scaleLabel.min = minOctave * 1200;
    config.reference.scaleLabel.max = maxOctave * 1200;
    renderApp();
  }
  function addTuningDlg() {

    let selectedNoteCount = 0;
    config.tunings.filter(tuning => tuning.selected).forEach(sourceTuning => (
      sourceTuning.notes.filter(note => note.selected).forEach(note => {
        selectedNoteCount++;
      })
    ))

    const selectedNotesOption = (selectedNoteCount == 0) ? '' :
      `<option value="${ref.tuningScales.FROM_NOTES}">Selected notes</option>`;

    const modalContent = `
      <div class="modal-content config-edit">

        ${modalHeader(ref.uiStrings.addTuning)}

        <div class="modal-row">
          <label for="dlgAddTuning-scaleType">Scale type</label>
          <select id="dlgAddTuning-scaleType" onchange="ui.addTuningDlgChangeType()">
            ${selectedNotesOption}
            <option value="${ref.tuningScales.LINEAR}" ${uiState.addTuningScaleType == ref.tuningScales.LINEAR ? 'selected' : ''}>Harmonic, linear</option>
            <option value="${ref.tuningScales.EXPONENTIAL}" ${uiState.addTuningScaleType == ref.tuningScales.EXPONENTIAL ? 'selected' : ''}>Equal division, exponential</option>
          </select>
        </div>
        <hr />
        
        <div id="dlgAddTuning-scaleTypeOptions">${addTuningDlgRenderScaleTypeOptions(uiState.addTuningScaleType)}
        </div>

        <hr />
        <div class="modal-row right">
          <button onclick="ui.addTuningFromDlg()">${ref.uiStrings.addTuning}</button>
        </div>

      </div>
    `

    showModal(modalContent);
  }
  function addTuningFromDlg() {
    const scaleType = getElement('dlgAddTuning-scaleType').value;
    if (scaleType == ref.tuningScales.FROM_NOTES) {
      addTuning({ scaleType });
    } else if (scaleType == ref.tuningScales.LINEAR) {
      const limit = parseInt(getElement('dlgAddTuning-limit').value, 10) || 11;
      addTuning({ scaleType, limit });
    } else if (scaleType == ref.tuningScales.EXPONENTIAL) { 
      const base = parseFloat(getElement('dlgAddTuning-base').value, 10) || 2;
      const divisions = parseInt(getElement('dlgAddTuning-divisions').value, 10) || 12;
      addTuning({ base, scaleType, divisions });
    }
    renderApp();
  }
  function addTuningDlgRenderScaleTypeOptions(scaleType) {
    html = [];
    if (scaleType == ref.tuningScales.LINEAR) {
      html.push(`
        <div class="modal-row">
          <label for="dlgAddTuning-limit">Integer limit</label>
          <input id="dlgAddTuning-limit" width="8" value="${uiState.addTuningLimit || 11}"></input>
        </div>
      `)
    } else if (scaleType == ref.tuningScales.EXPONENTIAL) {
      html.push(`
        <div class="modal-row">
          <label for="dlgAddTuning-base">Repeat ratio</label>
          <input id="dlgAddTuning-base" size="3" value="${uiState.addTuningBase || 2}"></input>
          <span class="hint">Examples: 2 for EDO, 3 for Bohlen Pierce.</span>
        </div>
        <div class="modal-row">
          <label for="dlgAddTuning-divisions">Divisions</label>
          <input id="dlgAddTuning-divisions" size="3" value="${uiState.addTuningDivisions || 12}"></input>
        </div>
      `)
    } 

    return html.join('');
  }
  function addTuningDlgChangeType() {
    const scaleType = getElement('dlgAddTuning-scaleType').value;
    getElement('dlgAddTuning-scaleTypeOptions').innerHTML = addTuningDlgRenderScaleTypeOptions(scaleType);
  }
  function removeTuning(tuningId) {
    const found = config.tunings.find((i) => (i.id == tuningId));
    const foundIndex = config.tunings.indexOf(found);
    if (foundIndex > -1) {
      config.tunings.splice(foundIndex, 1);
    }
    renderApp();
  }
  function duplicateTuning(tuningId) {
    const found = config.tunings.find((i) => (i.id == tuningId));
    const foundIndex = config.tunings.indexOf(found);
    if (foundIndex > -1) {
      const tuning = cloneObject(config.tunings[foundIndex]);
      tuning.id = config.nextTuningId++
      config.tunings.push(tuning);
    }
    renderApp();
  }
  function downloadTuning(tuningId) {
    const found = config.tunings.find((i) => (i.id == tuningId))
    const foundIndex = config.tunings.indexOf(found)
    if (foundIndex > -1) {
      const tuning = config.tunings[foundIndex];
      const downloadText = notesForExportAsSCL(tuning);
      download(downloadText, `${tuning.label}.scl`); // TODO: improve robustness
    }
  }
  function tuningPropertiesDlg(tuningId) {
    const tuning = config.tunings.find((i) => (i.id == tuningId));

    const modalContent = `
      <div class="modal-content config-edit">

        ${modalHeader(ref.uiStrings.tuningProperties)}

        <div class="modal-row">
          <label for="dlgTuningProperties-base">Highest export ratio</label>
          <input id="dlgTuningProperties-base" length="6" value="${tuning.base || 2}"></input>
          <span class="hint">Blank to export all.</span>
        </div>

        <div class="modal-row">
          <label for="dlgTuningProperties-base">Label</label>
          <input id="dlgTuningProperties-label" multiline value="${tuning.label || ''}"></input>
        </div>

        <div class="modal-row">
          <label for="dlgTuningProperties-base">Description</label>
          <textarea id="dlgTuningProperties-description">${tuning.description || ''}</textarea>
        </div>

        <hr />
        
        <div class="modal-row right">
          <button onclick="ui.saveTuningProperties(${tuningId})">${ref.uiStrings.save}</button>
        </div>

      </div>
    `

    showModal(modalContent);
  }  
  function saveTuningProperties(tuningId) {
    const tuning = config.tunings.find((i) => (i.id == tuningId));

    if (tuning) {
      tuning.base = getElement('dlgTuningProperties-base').value;
      tuning.label = getElement('dlgTuningProperties-label').value;
      tuning.description = getElement('dlgTuningProperties-description').value;
      renderApp();
    }
  }
  function removeSelectedNotes(tuningId) {
    const tuning = config.tunings.find((i) => (i.id == tuningId)); // todo: refactor into new  findTuning()
    if (tuning) {
      tuning.notes = tuning.notes.filter(t => !t.selected); // TODO: separate concerns
      renderApp();
    }
  }
  
  function toggleTuningSelection(findId) { // (un)select a tuning row
    const found = config.tunings.find((i) => (i.id == findId));
    const foundIndex = config.tunings.indexOf(found);
    if (foundIndex > -1) {
      found.selected = !found.selected;
    }
    renderApp();
  }
  function selectToggleNote({ tuningId, noteNumber }) {
    
    let foundNote;

    const foundTuning = config.tunings.find(tuning => tuning.id == tuningId);
    if (foundTuning) {
      foundNote = foundTuning.notes.find(note => note.number == noteNumber);
    }
    if (foundNote) {
      foundNote.selected = !foundNote.selected;
      renderApp();
    }
  }
  function selectAllTuningNotes(tuningId) {
    const foundTuning = config.tunings.find((tuning) => (tuning.id == tuningId));
    const scale = config.reference.scaleLabel;

    if (foundTuning) { // select all visible notes
      foundTuning.notes.filter(note => (note.centsET12 <= scale.max && note.centsET12 >= scale.min)).forEach((note => note.selected = true));
      renderApp(); // TODO: optimization: mutate the DOM
    }    
  }  
  function unselectAllTuningNotes(tuningId) {
    const foundTuning = config.tunings.find((tuning) => (tuning.id == tuningId));
    if (foundTuning) {
      foundTuning.notes.forEach((note => note.selected = false));
      renderApp();
    }
    // TODO: optimization: mutate the DOM
  }
  function selectAnalysisNoteProperties() { // Properies of last-touched note
    if (uiState.activeAnalysis != ref.analysisModes.NOTE_PROPERTIES) {
      uiState.activeAnalysis = ref.analysisModes.NOTE_PROPERTIES;
      renderApp(); // TODO: mutable elements rather than full redraw
    }
  }
  function selectAnalysisNotes() {
    if (uiState.activeAnalysis != ref.analysisModes.NOTES) {
      uiState.activeAnalysis = ref.analysisModes.NOTES;
      renderApp(); // TODO: mutable elements rather than full redraw
    }
  }
  function changeAnalysisLimit() {
    const limit = parseInt(getElement('analysis-select-limit').value, 10);
    if (limit) {
      config.harmonicAnalysisIntegerLimit = limit;
      initAnalysis();
      renderApp();
    }
  }
  
  // Resizing and layout
  function resizeAppViewport() {
    if (env.debug.resize)
      logInfo('resizeAppViewport() ' + '-'.repeat(10))

    let b = getElement('body')
    geometry.resizeDirty = (geometry.width !== b.offsetWidth) || (geometry.height == b.offsetHeight)

    geometry.width = b.offsetWidth
    geometry.height = b.offsetHeight

    if (geometry.resizeDirty) {
      resizeLayout()
      renderApp()
    }
    if (env.debug.resize)
      logInfo('resizeAppViewport() geometry:', geometry)
  }
  function resizeLayout() {
    // modifies: g
    g.pageMargin = {
      top: s.pageMargin.top * s.bodySize,
      right: s.pageMargin.right * s.bodySize,
      bottom: s.pageMargin.bottom * s.bodySize,
      left: s.pageMargin.left * s.bodySize,
    }
  }

  // === Rendering
  // Icons: full SVG
  const iconConfig = (active) => (`
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 1000 1000"
      >
      <g>
        <path class="iconPath ${active ? 'active' : ''}" d="M362,829l24,96c8,34,45,63,81,63h65c35,0,72-28,81-63l24-96c8-34,44-55,78-45l95,27c34,9,77-7,95-38l32-56c17-31,11-77-14-102l-71-69c-25-25-25-65,0-90l71-69c25-25,32-70,14-102L908,226c-18-31-61-48-95-38l-95,27c-34,9-69-10-78-45l-24-96C605,38,568,10,532,10h-65c-35,0-72,28-81,63l-24,96c-8,34-44,55-78,45L187,188c-34-9-77,7-95,38l-32,56c-17,31-11,77,14,102l71,69c25,25,25,65,0,90l-71,69c-25,25-32,70-14,102L92,773c17,31,61,48,95,38l95-27C317,774,353,795,362,829L362,829z M500,369c72,0,130,58,130,130c0,72-58,130-130,130c-72,0-130-58-130-130C369,427,427,369,500,369z" />
      </g>
    </svg>
  `);
  const iconAddTuning = (active) => (`
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 100 100"
      >
      <g>
        <path class="iconPath-lines" d="M50,15 L50,85z M15,50 L85,50z" />
      </g>
    </svg>
  `);
  const iconHelp = (active) => (`
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 10000 10000"
      xml:space="preserve">
      <g class="iconPath ${active ? 'active' : ''}">
        <path stroke="none" d="M 4036,7054 C 3803,5351 4693,4530 4852,4398 5021,4256 6509,2988 5599,2140 4689,1291 3033,2445 2701,2737 L 2701,738 C 3041,535 4121,124 5065,127 7354,159 7967,1384 7981,2531 7991,3711 6790,4811 6560,5002 6405,5130 5408,5829 5782,7054 L 4036,7054 Z M 5006,9963 C 4243,9950 3778,9374 3770,8861 3761,8347 4212,7772 5006,7771 5799,7770 6226,8310 6221,8861 6215,9411 5768,9976 5006,9963 Z"/>
      </g>
    </svg>
  `);
// Icons: SVG fragments
  const addViewZoomIcons = () => {
    const html = [];

    ref.scaleViewIcons.forEach(iconSpec => {
      html.push(`
        <button
          class="icon add"
          onclick="ui.scaleViewZoom({ minOctave: ${iconSpec.minOctave}, maxOctave: ${iconSpec.maxOctave} });"
          title="${iconSpec.hint}"
        >${renderZoomIcon(iconSpec)}</button>
      `)
    })

    return html.join('');

    function renderZoomIcon(iconSpec) {
      return `
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 10 10"
        >
        <g>
          <text x="5" y="7.6" class="icon-text">${iconSpec.label}</text>
        </g>
      </svg>
    `
      // return `${iconSpec.label}`;
    }
  }
  const toolbarTools = () => {
    const startItem = '<div class="item">';
    const endItem = '</div>';
    const addTuningIcon = `
      <button
        class="icon add"
        onclick="ui.addTuningDlg();"
        title="${ref.uiStrings.addTuning}"
      >${iconAddTuning()}</button>
    `;
    const configIcon = `
      <button
        onclick="ui.showAppConfig(event);"
        class="icon ${uiState.showConfig ? 'active' : ''}"
        title="Configure"
      >${iconConfig(uiState.showConfig)}</button>
    `;
    const helpIcon = `
      <button
        onclick="ui.toggleHelp(event);"
        class="icon ${uiState.showHelp ? 'active' : ''}"
        title="Help"
      >${iconHelp(uiState.showHelp)}</button>
    `;

    /*
    const selectRefLabel = `<label for="select-ref">Units</label><select id="select-ref">${ref.scaleViewLabels.map((i) => ('<option class="o1">' + i.label)).join('')}</select>`;
    const selectRefScale = `<label for="select-ref">Scale</label><select id="select-ref"><option>Linear Harmonic</option><option selected>Octave</option></select>`;
    */
    return [
      startItem,
        addTuningIcon,
      endItem,
      startItem,
        addViewZoomIcons(),
      endItem,
      //startItem,
      //  selectRefLabel,
      //  selectRefScale,        
      //endItem,
      startItem,
            configIcon,
        helpIcon,
      endItem
    ].join('');
  }
  const iconRemove = (x, y) => `
    <g class="icon-shape-outline pointer-transparent" transform="translate(${x + s.bodySize * 0.6} ${y + s.bodySize * 0.6}) scale(${s.bodySize * 0.008})">
      <path class="iconPath-lines" d="M-30,30 L30,-30 M30,30 L-30,-30" />
    </g>
  `;
  const iconDownload = (x, y) => `
    <g class="icon-shape-outline pointer-transparent" transform="translate(${x + s.bodySize * 0.6} ${y + s.bodySize * 0.6}) scale(${s.bodySize * 0.008})">
      <path class="iconPath-lines" d="M-40,20 L-40,40 L40,40 L40,20 M0,-40 L0,20 M-30,-10 L0,20 L30,-10" />
    </g>
  `;
  const iconDuplicate = (x, y) => `
    <g class="icon-shape-outline pointer-transparent" transform="translate(${x + s.bodySize * 0.6} ${y + s.bodySize * 0.56}) scale(${s.bodySize * 0.008})">
      <rect class="iconPath-lines" x="-40" y="-35" width="60" height="60" rx="6" ry="6" style="opacity: 0.5" />
      <rect class="iconPath-filled-lines" x="-15" y="-10" width="60" height="60" rx="8" ry="8" />
      <path class="iconPath-lines" d="M15,5 L15,35 M0,20 L30,20" style="stroke-width: 7px"/>
    </g>
  `;
  const iconProperties = (x, y) => `
    <g class="icon-shape-outline pointer-transparent" transform="translate(${x + s.bodySize * 0.6} ${y + s.bodySize * 0.6}) scale(${s.bodySize * 0.008})">
      <circle class="iconPath" cx="-30" cy="40" r="10" />
      <circle class="iconPath" cx="-0" cy="40" r="10" />
      <circle class="iconPath" cx="30" cy="40" r="10" />
    </g>
  `;
  const iconRemoveSelectedNotes = (x, y) => `
    <g class="pointer-transparent" transform="translate(${x} ${y}) scale(${s.bodySize * 0.012})">
      <circle class="icon-shape-fill" cx="45" cy="45" r="22" style="opacity: 0.6;" />
      <circle class="icon-shape-fill" cx="55" cy="55" r="22" style="opacity: 0.8;"  />
      <path class="iconPath-lines" d="M41,56 L51,66 L69,48" style="stroke-width: 5px; opacity: 0.5;" />
      <path class="iconPath-lines" d="M20,80 L80,20 M80,80 L20,20" style="stroke-width: 5px;" />
    </g>
  `;
  const iconAddNote = (x, y) => `
    <g class="pointer-transparent" transform="translate(${x} ${y}) scale(${s.bodySize * 0.012})">
      <circle class="icon-shape-fill" cx="45" cy="55" r="25" />
      <path class="iconPath-lines" d="M80,20 L80,40 M70,30 L90,30" style="stroke-width: 5px" />
    </g>
  `;
  const iconSelectAll = (x, y) => `
    <g class="pointer-transparent" transform="translate(${x} ${y}) scale(${s.bodySize * 0.012})">
      <circle class="icon-shape-fill" cx="45" cy="45" r="22" style="opacity: 0.7;" />
      <circle class="icon-shape-fill" cx="55" cy="55" r="22" />
      <path class="iconPath-lines" d="M41,56 L51,66 L69,48" style="stroke-width: 5px" />
    </g>
  `;
  const iconUnselectAll = (x, y) => `
    <g class="pointer-transparent" transform="translate(${x} ${y}) scale(${s.bodySize * 0.012})">
      <circle class="icon-shape-fill" cx="45" cy="45" r="22" style="opacity: 0.7;" />
      <circle class="icon-shape-fill" cx="55" cy="55" r="22" />
    </g>
  `;

  // Modal
  function showModal(content) {
    getElement('modal').innerHTML = content
    getElement('modal').style.display = 'block'
  }
  function hideModal() {
    getElement('modal').style.display = 'none'
  }
  const modalHeader = (title) => `
    <div class="modal-row-header">
      <h2>${title}</h2>
      <button
        onclick="ui.hideModal();"
        title="Cancel"
      >${ref.uiStrings.modalCloseButton}</button>
    </div>
  `

  // Render small components
  const buttonSVG = ({ x, y, action, text = '', svg = '', className, hint }) => {
    const size = 1.2;
    const SVG = `
      <rect role="button" class="buttonSVG ${className}" x="${x}" y="${y}" width="${s.bodySize * size}" height="${s.bodySize * size}" rx="4" onclick="${action}">
      <title>${hint || ''}</title>
      </rect>
      ${svg}
      <text class="tuning-point-number pointer-transparent" x="${x + s.bodySize * size * 0.5 }" y="${y + s.bodySize * size * 0.66}">
       ${text}
      </text>
    `;// ref.buttons.REMOVE
    return SVG;
  }

  // Render tuning visualizer
  function composeNoteFloatHint(note) { // compose multi-line float text.

    let label;
    if (note.label2 && note.hint) {
      label = `${note.label2} (${note.hint})`;
    } else {
      const labelBuilder = [];
      if (note.label2) labelBuilder.push(note.label2);
      if (note.hint) labelBuilder.push(note.hint);
      label = labelBuilder.join(': ');
    }

    const titleBuilder = [`${note.number}: ${note.frequency.toFixed(3)} Hz`];
    if (label) titleBuilder.push(label);
    titleBuilder.push(`${note.centsET12.toFixed(2)} cents`);
    titleBuilder.push(`${note.ratio.toFixed(5)} ratio`);
     
    return titleBuilder.join('\n');
  }
  function tuningPointSVG({ x, y, w, h, note, tuning }) {
    return `
      <g>
        <title>${composeNoteFloatHint(note)}</title>

        ${(note.isRatio && note.level <= config.noteShowLabelsBelowLevel) || (!note.isRatio && (note.label2 || note.hint)) ? `
          <g>
            <title>${note.hint || ''}</title>
            <rect class="tuning-point-label-bg ${note.selected ? 'selected' : ''}" x="${x - s.bodySize * 0.6}" y="${y + s.bodySize * 0.15}" width="${s.bodySize * 1.2}" height="${s.bodySize * 0.8}" />
            <text class="tuning-point-label pointer-transparent ${note.selected ? 'selected' : ''}" x="${x - 0.6}" y="${y + s.bodySize * 0.75}">
              ${note.label2 || note.hint}
            </text>
          </g>
        `: ''}

        <circle id="t${tuning.id}n${note.number}" class="tuning-point-number-bg ${note.selected ? 'selected' : ''}" cx="${x}" cy="${y + h + s.bodySize * 0.60}" r="${s.bodySize * 0.65}" onclick="ui.selectToggleNote({ tuningId: ${tuning.id}, noteNumber: ${note.number} })"/>
        <text class="tuning-point-number${note.isRatio ? '-ratio' : ''} pointer-transparent ${note.selected ? 'selected' : ''}" x="${x - 0.5}" y="${y + h + s.bodySize * 0.85}">
          ${note.isRatio ? note.label : note.number}
        </text>

      </g>
    `
  }
  function noteLinesSVG({ x1, x2, y1, y2, h, tuning, backgroundY2, firstTuning = false }) {
    // Draw a reference tuning scale
    const vo = tuningPointVOffset = h * 0.1;
    const tuningPointWidth = 2;
    const scale = config.reference.scaleLabel;
    const positions = tuning.notes.map((n) => {

      let position = 0;
      positionOnScaleLine();
      scaledPosition = x1 + position * (x2 - x1);
      const subtleClass = (
          (tuning.scaleType == ref.tuningScales.EXPONENTIAL) ||
          (n.level && n.level < config.noteShowSubtleLinesBelowLevel)
        ) ? '' : 'subtle';

      // Only draw the notes within display viewport range
      return (position >= 0 && position <= 1)
        ? `
          <path class="${(firstTuning) ? 'reference-' : ''}scale-lines ${subtleClass}" d="
            M${scaledPosition},${(firstTuning) ? (backgroundY2) : y2}
            L${scaledPosition},${y1}
          " />
          ${
            tuningPointSVG({
              x: scaledPosition, y: 
              y1 + vo, 
              w: tuningPointWidth, 
              h: s.bodySize,
              selected: false, 
              note: n,
              tuning
            })
          }
        `
        : '';
      
      function positionOnScaleLine() {
        switch (scale.enum) { // todo: reduce coupling
          case 0:
            position = (n.frequency - scale.min) / ( scale.max - scale.min)
            break
          case 1:
            position = (n.octaves - scale.min) / ( scale.max - scale.min)
            break
          case 2:
            // position = (n.centsET12 - scale.min) / scale.max
            position = (n.centsET12 - scale.min) / ( scale.max - scale.min)
            break
        }
      }
    });

    return `
      <g>
        ${positions}
      </g>
    `
  }
  function referenceScaleSVG({x1, x2, y1, y2, h, rowLabel = '', labelX = g.pageMargin.left}) {
    // Draw a reference tuning scale
    const rs = config.reference.scaleLabel;
    const onScale = -rs.min / ( rs.max - rs.min );
    const refFreqX = x1 + (x2 - x1) * onScale;
    return `
      <g>
        <g>
          <title>${config.noteRefHz.toFixed(config.precisionRefHzHint)} Hz</title>
          <text class="reference-freq" x="${refFreqX + s.bodySize * 0.4}" y="${y1 - s.bodySize * 0.57}">
          ${config.noteRefHz.toFixed(config.precisionRefHz)} Hz
          </text>
        </g>
        <path class="reference-scale-bg" d="
          M${x1},${y2}
          L${x1},${y1}
          L${x2},${y1}
          L${x2},${y2}
        " />
      </g>
    `
  }
  function tuningScaleSVG({ x1, x2, y1, h, tuning, labelX = g.pageMargin.left, backgroundY2, firstTuning }) {
    // Draw a reference tuning scale
    return `
      <g>
        <path class="tuning-scale-selection" onclick="ui.toggleTuningSelection(${tuning.id})" d="
          M${0},${y1 + h}
          L${0},${y1}
          L${x2},${y1}
          L${x2},${y1 + h}
        " />
        <path class="tuning-scale-bg${firstTuning ? '-reference' : ''}${tuning.selected ? ' selected' : ''} pointer-transparent" d="
          M${x1},${y1 + h}
          L${x1},${y1}
          L${x2},${y1}
          L${x2},${y1 + h}
          " />
        <g>
          <title>${tuning.label}</title>
          <clipPath id="tuning-cp-${tuning.id}">
            <rect x="0" y="${y1}" width="${x1 - labelX}" height="${h}" />
          </clipPath>          
          <text class="tuning-name pointer-transparent" x="${labelX}" y="${y1 + s.bodySize * 0.5}" clip-path="url(#tuning-cp-${tuning.id})">
            ${tuning.label}
          </text>
        </g>
        ${tuningStripButtons()}          
        }
        ${noteLinesSVG({x1, x2, y1, y2: y1 + h, h, tuning, backgroundY2, firstTuning})}
      </g>
    `;

    function tuningStripButtons(params) {
      // row 1 (tuning) Remove, Download, Duplicate*, Properties*
      // row 2 (notes) Remove*, Add*, Select all, Deselect all, 
      const gridSize = s.bodySize * 1.4;

      return `
        ${buttonSVG({ 
          x: x(0), y: y(0),
          action: 'ui.removeTuning(' + tuning.id + ')', 
          svg: iconRemove(x(0), y(0)),
          className: 'remove', 
          hint: ref.uiStrings.removeTuning
        })}
        ${buttonSVG({ 
          x: x(1), y: y(0),
          action: 'ui.downloadTuning(' + tuning.id + ')', 
          svg: iconDownload(x(1), y(0)), 
          className: 'download',  // not used?
          hint: ref.uiStrings.downloadTuning
        })}
        ${buttonSVG({ 
          x: x(2), y: y(0),
          action: 'ui.duplicateTuning(' + tuning.id + ')', 
          svg: iconDuplicate(x(2), y(0)),
          className: 'duplicate',  // not used?
          hint: ref.uiStrings.duplicateTuning
        })}
        ${buttonSVG({ 
          x: x(3), y: y(0),
          action: 'ui.tuningPropertiesDlg(' + tuning.id + ')', 
          svg: iconProperties(x(3), y(0)), 
          className: 'download',  // not used?
          hint: ref.uiStrings.tuningProperties
        })}

        ${buttonSVG({ 
          x: x(0), y: y(1),
          action: 'ui.removeSelectedNotes(' + tuning.id + ')', 
          svg: iconRemoveSelectedNotes(x(0), y(1)), 
          className: 'remove', 
          hint: ref.uiStrings.removeSelectedTuningNotes
        })}
        ${buttonSVG({ 
          x: x(1), y: y(1),
          action: 'ui.addNote(' + tuning.id + ')', 
          svg: iconAddNote(x(1), y(1)), 
          className: 'add-note unavailable', // not used?
          hint: ref.uiStrings.addTuningNote
        })}
        ${buttonSVG({ 
          x: x(2), y: y(1),
          action: 'ui.selectAllTuningNotes(' + tuning.id + ')', 
          svg: iconSelectAll(x(2), y(1)), 
          className: 'select-all', 
          hint: ref.uiStrings.selectAllTuningNotes
        })}
        ${buttonSVG({ 
          x: x(3), y: y(1),
          action: 'ui.unselectAllTuningNotes(' + tuning.id + ')', 
          svg: iconUnselectAll(x(3), y(1)), 
          className: 'unselect-all', 
          hint: ref.uiStrings.unselectAllTuningNotes
        })}
      `;

      function x(gridX) {
        return labelX + gridSize * gridX;
      }

      function y(gridY) {
        return y1 + gridSize * 0.6 + gridSize * gridY;
      }

    }
  }

  // Render analysis
  const analysisOptionsHTML = () => `
    <span class="analysis-options">
      <label for="analysis-select-limit">Integer limit </label>
      <select id="analysis-select-limit" onchange="ui.changeAnalysisLimit()" class="analysis-options-select">
  ` +
      ref.supportedPrimes.map( limit => (`
      <option value="${limit}"${(limit == config.harmonicAnalysisIntegerLimit ? ' selected' : '')}>${limit}</option>      
      `)).join('')
  + `
      </select>
    </span>
  `;
  const analysisTabsHTML = () => `
    <div class="filter-group">
      <span class="tabs-title hidden">Analysis</span>
      <button class="filter ${uiState.activeAnalysis == ref.analysisModes.NOTE_PROPERTIES ? ' selected' : ''} " onclick="ui.selectAnalysisNoteProperties()">Note properties</button>
      <button class="filter ${uiState.activeAnalysis == ref.analysisModes.NOTES ? ' selected' : ''} " onclick="ui.selectAnalysisNotes()">Intervals</button>
      ${analysisOptionsHTML()}
    </div>
    <div class="tabs-rule"></div>
  `;
  const analysisTuningsHTML = () => { // NOT USED
    const tuningsSelectedCount = config.tunings.reduce((
      accumulator, currentValue) => (currentValue.selected ? accumulator + 1 : accumulator), 0
    );
    const tuning = config.tunings.find((tuningItem) => (tuningItem.selected)); // find first selected tuning

    if (tuning && tuning.scaleType == ref.tuningScales.EXPONENTIAL && tuningsSelectedCount == 1) {
      // Hint: Revisit if octave tunings are no longer pure log-scale, e.g. with absolute Hz offset.
      return analysisEDOTuningIntervalsHTML(tuning);
    } else if (tuningsSelectedCount == 1) {
      return analysisSingleTuningTable(tuning);
    } else if (tuningsSelectedCount == 2) {
      return analysisTwoTuningsTable(config.tunings.filter(tuning => tuning.selected));
    } else {
      return '<p>Select one or two tunings.</p>';
    }
  }
  const analysisEDOTuningIntervalsHTML = (tuning) => {
    return `<p>Interval analysis of ED tuning: ${tuning.label}.</p><p class="not-available">${ref.uiStrings.featureNotAvailable}.</p>`;
  }
  const analysisSingleTuningTable = (tuning) => {
    return `<p>Interval analysis of non-ED tuning: ${tuning.label}.</p><p class="not-available">${ref.uiStrings.featureNotAvailable}.</p>`;
  }
  const analysisTwoTuningsTable = (tunings) => {
    return `<p>Interval analysis of two tunings: ${tunings.map(tuning => tuning.label).join(', ')}.</p><p class="not-available">${ref.uiStrings.featureNotAvailable}.</p>`;
  }
  const analysisNotePropertiesHTML = () => {
    // show properties for the last-touched note.
    return `<p>Properties of last-touched note.</p><p class="not-available">${ref.uiStrings.featureNotAvailable}.</p>`;
  }  
  const analysisNoteIntervalsHTML = () => {
    // create a list of selected notes from all tunings, as { tuning, note } pairs
    const tuningNotes = allSelectedNotes();
    if (tuningNotes.length == 0) {
      return '<p>Select notes in selected tunings.</p>';
    }
    // return `<div><div>Interval analysis of notes: ${tuningNotes.map(tuningNote => noteDisplayName({ tuning: tuningNote.tuning, note: tuningNote.note })).join(', ')}</div>${analysis()}</div>`; // temporary (shows ambiguous note letter!)

    // TODO: refactor to separate concerns
    const table = [];
    table.push(`<table>`);

    // row header 1
    table.push(`<tr>`);
    table.push(`<th><span class="tuning-name-inline">Tuning</span></th><th></th>`);
    table.push(
      config.tunings.filter(tuning => tuning.selected).map((tuning) => 
        (tuning.selectedNoteCount > 0) ? `
         <th class="tuning-name-inline" colspan="${tuning.selectedNoteCount}">${tuning.label}</th>
        ` : '').join('')
    );
    table.push(`</tr>`);
    
    // row header 2
    table.push(`<tr>`);
    table.push(`<th></th><th>Note</th>`);
    table.push(
      config.tunings.filter(tuning => tuning.selected).map((tuning) => (
        tuning.notes.filter(note => note.selected).map((note) => (`
          <th class="note-name">${!note.isRatio ? noteDisplayName({ tuning, note }) : ''} <span class="note-number-inline">${note.isRatio ? note.label : note.number}</span></th>
        `)).join('')
      )
    ).join(''));
    table.push(`</tr>`);

    // row body
    var prevTuningId;
    config.tunings.filter(tuning => tuning.selected).map(tuning => {

      // Row per note
      const noteGrid = tuning.notes.filter(note => note.selected).map(note => {

        table.push(`<tr>`);
        // Column 1: tuning label, if we've moved to a new tuning
        if (prevTuningId != tuning.id || prevTuningId == undefined ) {
          table.push(`<th class="tuning-name-inline" rowspan="${tuning.selectedNoteCount}">${tuning.label}</th>`);
          prevTuningId = tuning.id;
        }
        
        // Column 2: note label
        table.push(`
          <th class="note-name right">${!note.isRatio ? noteDisplayName({ tuning, note }) : ''} <span class="note-number-inline">${note.isRatio ? note.label : note.number}</span></th>
        `);

        // Column 3...: grid column cells (one per note)
        const cells = tuningNotes.map((tuningNote) => {
          const note2 = tuningNote.note;
          const a = analysis(note, note2);
          return `
            <td class="${a.class} nb">${a.label}</td>
          `;
        }).join('');

        table.push(cells);
        table.push(`</tr>`);
      })

    });
  

    table.push(`</table>`);
    return table.join('');

    function analysis(n1, n2) { // TODO
      const ratio = findRatioForFrequency({ f1: n1.frequency, f2: n2.frequency, limit: config.harmonicAnalysisIntegerLimit });
      return {
        label: ratio.label,
        level: ratio.level,
        class: ((n1.frequency == n2.frequency) ? 'cell-equal' : '')
      };
    }

    function findRatioForFrequency({ f1, f2, significanceLimit = config.harmonicAnalysisSignificanceLimit }) {
      let bestFit = { errorToRatioCents: undefined };
      ref.harmonicRatios.forEach(r => {
        const hRatio = r.ratio;
        const errorHz = f2 - (f1 * r.ratio);
        const errorToRatioCents = frequenciesToCentsInterval(f1 * r.ratio, f2);
        const diffCents = frequenciesToCentsInterval(f1, f2);
        if (bestFit.errorToRatioCents == undefined || Math.abs(errorToRatioCents) < Math.abs(bestFit.errorToRatioCents)) {
          const key = `${r.n}/${r.m}`
          const noteNameHarmonic = ref.noteNamesHarmonic[key];
          const level = noteNameHarmonic && noteNameHarmonic.level || ref.leastHarmonicLevel;
          bestFit = { diffCents, errorToRatioCents: errorToRatioCents, diffHz: errorHz, ratio: hRatio, n: r.n, m: r.m, level, noteNameHarmonic }
        }
      });

      // format the best result
      const labelCents = `<span class="analysis-cents">${bestFit.diffCents.toFixed(2)}&cent;</span> `;
      const levelClass = (bestFit.level < 4 || bestFit.n < 9 || bestFit.m < 9) ? '' : 'subtle';
      const ratioHint = (bestFit.noteNameHarmonic && bestFit.noteNameHarmonic.hint || '');
      const labelRatio = (bestFit.n == 1 && bestFit.m == 1) ? '' : `<span title="${ratioHint}">${bestFit.n}/${bestFit.m}</span>`;
      const labelError = (Math.abs(bestFit.errorToRatioCents) < 0.0000001) ? '' :
          `<br/><span class="a-diff"><span title="${bestFit.errorToRatioCents.toFixed(config.precisionDiffCentsHint)} &cent;">${bestFit.errorToRatioCents < 0 ? '&minus;' : '+'}${Math.abs(bestFit.errorToRatioCents).toFixed(config.precisionDiffCents)}&cent</span> <span title="${bestFit.diffHz.toFixed(config.precisionDiffHzHint)} Hz">(${Math.abs(bestFit.diffHz).toFixed(config.precisionDiffHz)}Hz)</span></span>`;
      const formattedBestFitObject = {
        diffCents: bestFit.errorToRatioCents,
        diffHz: bestFit.diffHz,
        ratio: bestFit.ratio,
        label: (bestFit.errorToRatioCents == 0 && bestFit.n == 1 && bestFit.m == 1) ? '1' : `${labelCents}<span class="${levelClass}">${labelRatio}${labelError}</span>`
      }

      return formattedBestFitObject;
    }

    function allSelectedNotes() { // this flat map might be easier to process?
      const tuningNotes = [];
      config.tunings.filter(tuning => tuning.selected).forEach((tuning) => {
        tuning.notes.filter(note => note.selected).forEach((note) => {
          tuningNotes.push({ tuning, note })
        })
        tuning.selectedNoteCount = tuning.notes.filter(note => note.selected).length;
      })
      return tuningNotes;
    }
  }
  const analysisHTML = () => {
    let analysis;
    if (uiState.activeAnalysis == ref.analysisModes.TUNINGS) { analysis = analysisTuningsHTML() }
    if (uiState.activeAnalysis == ref.analysisModes.NOTE_PROPERTIES) { analysis = analysisNotePropertiesHTML() }
    if (uiState.activeAnalysis == ref.analysisModes.NOTES) { analysis = analysisNoteIntervalsHTML() }

    return [
      '<div class="textSection">',
      analysis,
      '</div>'
    ].join('');
  };

  // Render main UI parts
  const toolbarHTML = (contentsOnly) => (
    ((!contentsOnly) ? '<div class="toolbar">' : '')
    + `
      <div class="title">${(env.omitLogo ? '' : ref.logo + ' ')}${ref.title}</div>
      ${toolbarTools()}
    `
    + ((!contentsOnly) ? '</div>' : '')
  );
  const helpHTML = () => `
    <div class="textSection help" id="helpContainer">
      <div class="help cols">
        <div class="help col">
          <p><b>${ref.title}</b> (c) John Valentine 2023.</p>
          <p>Version ${ref.version}.</p>
          <h1>About</h1>
          <p>${ref.title} visualises microtonal tunings.</p>
          <p>Learn more: <a href="README.md" target="_AboutXeTune">README.md</a></p>
          <p>View the source: <a href="https://github.com/j5v/xetune" target="_XeTuneSource">https://github.com/j5v/xetune</a></p>
        </div>
      </div>
    </div>
  `;
  function surfaceHTML() {
    const tuningBoxHeight = s.bodySize * 3;
    const tuningNameWidthChars = 12;
    const tuningNameWidth = s.bodySize * tuningNameWidthChars * s.bodyRatio;
    const tuningNameMargin = s.bodySize;
    const tuningBoxX1 = g.pageMargin.left + tuningNameWidth + tuningNameMargin;
    const referenceScaleTop = g.pageMargin.top + s.bodySize * 0.2;
    let nextRowY = referenceScaleTop;  // position for next SVG element to continue the vertical flow
    const tuningsHeight = nextRowY + (tuningBoxHeight + s.bodySize * 1) * ( config.tunings.length - 1 ) + tuningBoxHeight; // todo: remove repeats of this

    let firstTuning = true;
    const tuningRows = config.tunings.map((tuning) => {
      thisRowY = nextRowY;
      nextRowY += tuningBoxHeight + s.bodySize * 1;

      const svg = tuningScaleSVG({
        x1: tuningBoxX1, 
        x2: g.width - g.pageMargin.right - s.bodySize * 0.5,  // allows for note circles
        y1: thisRowY, 
        h: tuningBoxHeight,
        backgroundY2: tuningsHeight,
        tuning,
        firstTuning
      });
      firstTuning = false;

      return svg;
    }).join('');

    const tuningSVG = (config.tunings.length == 0) ? '' : `
      ${referenceScaleSVG({
        x1: tuningBoxX1, 
        x2: g.width - g.pageMargin.right * 2, 
        y1: referenceScaleTop, 
        y2: nextRowY,
        h: tuningBoxHeight,
        rowLabel: config.reference.scaleLabel.label,
        labelX: g.pageMargin.left
      })}

      ${tuningRows}
    `;

    const SVGHeight = nextRowY;

    const surfaceHTML = `
      <div class="rows">
        <div class="row">
          <div class="columns">
            <div class="column">

              <svg id="tuning"
                version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 ${g.width} ${SVGHeight}"
                style="width: ${g.width}px; height: ${SVGHeight}px;"
              >
                ${tuningSVG}
              </svg>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="columns">
            <div class="column" style="flex-basis: 100%;">
              ${analysisTabsHTML()}
              ${analysisHTML()}
            </div>
          </div>
        </div>
      </div>
    `;

    return surfaceHTML;
  }  
  const modalHTML = () => (`
    <div id="modal" class="modal"></div>
  `)
	const contentHTML = () => (`
    <div id="content">
      ${toolbarHTML()}
      ${uiState.showHelp ? helpHTML() : ''}
      ${surfaceHTML()}
      ${modalHTML()}
    </div>
  `);
  function renderApp() {
    if (geometry.resizeDirty)
      resizeLayout()
    setContent('body', contentHTML())
    geometry.resizeDirty = false
  }

  // report debug flags
  if (env.devBuild) log('Log flags: ' + Object.keys(env.debug).filter((i) => env.debug[i]).join(', '));

  // return interface
  let interface = { // UI interface
    init,
		renderApp,
    hideModal,
    showAppConfig,
    saveAppConfiguration,
    toggleHelp,
    removeTuning,
    addTuningDlg,
    addTuningDlgChangeType,
    addTuningFromDlg,
    downloadTuning,
    duplicateTuning,
    toggleTuningSelection,
    selectAnalysisNoteProperties,
    selectAnalysisNotes,
    selectToggleNote,
    unselectAllTuningNotes,
    selectAllTuningNotes,
    removeSelectedNotes,
    scaleViewZoom,
    changeAnalysisLimit,
    tuningPropertiesDlg,
    saveTuningProperties
  };
  if (env.devBuild) interface = {
    ...interface,
    uiState,
    env,
    ref,
    config,
    geometry,
    api,
    clearLocalStorage,
    harmonicsToLimit
  }
  return interface;
}

ui = app();