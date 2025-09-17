// Educational Content Generation Prompts for KoulutusBot
// Templates for generating Finnish educational content aligned with OPH standards

export const QUIZ_GENERATION_PROMPT = `
Luo opetuksellinen testi aiheesta "{subject}" {grade_level} tasolla.

Vaatimukset:
- 5-10 monivalintakysymystä
- Sisällytä selitykset oikeille vastauksille
- Käytä suomalaista opetuskontekstia ja esimerkkejä
- Sovita Opetushallituksen (OPH) opetussuunnitelman mukaisesti
- Sopiva vaikeustaso tasolle {grade_level}
- Käytä kieltä: {language}

Tulosformaatti (XML):
<quiz>
  <metadata>
    <title>Testin otsikko suomeksi</title>
    <subject>{subject}</subject>
    <grade_level>{grade_level}</grade_level>
    <language>{language}</language>
    <curriculum_standards>["OPH standard 1", "OPH standard 2"]</curriculum_standards>
  </metadata>
  <questions>
    <question id="1">
      <text>Kysymysteksti suomeksi</text>
      <options>
        <option correct="true">Oikea vastaus</option>
        <option>Väärä vastaus 1</option>
        <option>Väärä vastaus 2</option>
        <option>Väärä vastaus 3</option>
      </options>
      <explanation>Miksi tämä on oikea vastaus...</explanation>
    </question>
  </questions>
</quiz>
`;

export const COURSE_GENERATION_PROMPT = `
Luo opetuskurssi aiheesta "{subject}" {grade_level} tasolla.

Vaatimukset:
- 3-5 oppimismoduulia
- Selkeät oppmistavoitteet
- Sovita Opetushallituksen (OPH) opetussuunnitelman mukaisesti
- Sisällytä aktiviteetteja ja harjoituksia
- Käytä kieltä: {language}
- Arvioitu kesto: {duration} minuuttia

Tulosformaatti (XML):
<course>
  <metadata>
    <title>Kurssin otsikko</title>
    <subject>{subject}</subject>
    <grade_level>{grade_level}</grade_level>
    <language>{language}</language>
    <duration>{duration}</duration>
    <curriculum_standards>["OPH standard 1", "OPH standard 2"]</curriculum_standards>
  </metadata>
  <modules>
    <module id="1">
      <title>Moduulin otsikko</title>
      <content>Moduulin sisältö ja selitykset...</content>
      <activities>
        <activity type="reading">Lukutehtävä</activity>
        <activity type="exercise">Harjoitustehtävä</activity>
      </activities>
      <duration>15</duration>
    </module>
  </modules>
  <learning_objectives>
    <objective>Oppmistavoite 1</objective>
    <objective>Oppmistavoite 2</objective>
  </learning_objectives>
</course>
`;

export const PRESENTATION_GENERATION_PROMPT = `
Luo opetuspresentaatio aiheesta "{subject}" {grade_level} tasolla.

Vaatimukset:
- 8-15 diaani
- Visuaalisesti selkeä rakenne
- Sovita Opetushallituksen (OPH) opetussuunnitelman mukaisesti
- Sisällytä keskustelukysymyksiä
- Käytä kieltä: {language}

Tulosformaatti (XML):
<presentation>
  <metadata>
    <title>Presentaation otsikko</title>
    <subject>{subject}</subject>
    <grade_level>{grade_level}</grade_level>
    <language>{language}</language>
    <curriculum_standards>["OPH standard 1", "OPH standard 2"]</curriculum_standards>
  </metadata>
  <slides>
    <slide id="1" type="title">
      <title>Otsikkodia</title>
      <content>Johdanto aiheeseen</content>
    </slide>
    <slide id="2" type="content">
      <title>Dian otsikko</title>
      <content>Dian sisältö ja selitykset</content>
      <discussion_points>
        <point>Keskustelukysymys 1</point>
      </discussion_points>
    </slide>
  </slides>
</presentation>
`;

export const EXERCISE_GENERATION_PROMPT = `
Luo harjoitustehtäviä aiheesta "{subject}" {grade_level} tasolla.

Vaatimukset:
- 5-10 harjoitustehtävää
- Eri tehtävätyyppejä (monivalinta, täydennys, laskutehtävä)
- Sovita Opetushallituksen (OPH) opetussuunnitelman mukaisesti
- Sisällytä mallivastaukset
- Käytä kieltä: {language}

Tulosformaatti (XML):
<exercise_set>
  <metadata>
    <title>Harjoitustehtävien otsikko</title>
    <subject>{subject}</subject>
    <grade_level>{grade_level}</grade_level>
    <language>{language}</language>
    <curriculum_standards>["OPH standard 1", "OPH standard 2"]</curriculum_standards>
  </metadata>
  <exercises>
    <exercise id="1" type="multiple_choice">
      <question>Tehtävän kysymys</question>
      <options>
        <option correct="true">Oikea vastaus</option>
        <option>Väärä vastaus 1</option>
      </options>
      <solution>Selitys oikealle vastaukselle</solution>
    </exercise>
    <exercise id="2" type="fill_blank">
      <question>Täydennä lause: Suomi itsenäistyi vuonna ____.</question>
      <answer>1917</answer>
      <solution>Suomi julistautui itsenäiseksi 6.12.1917</solution>
    </exercise>
  </exercises>
</exercise_set>
`;

// Grade level mappings for Finnish education system
export const GRADE_LEVELS = {
  'perusopetus_1-2': 'Perusopetus 1.-2. luokka (6-8 vuotiaat)',
  'perusopetus_3-6': 'Perusopetus 3.-6. luokka (9-12 vuotiaat)', 
  'perusopetus_7-9': 'Perusopetus 7.-9. luokka (13-15 vuotiaat)',
  'lukio_1': 'Lukio 1. vuosi (16-17 vuotiaat)',
  'lukio_2': 'Lukio 2. vuosi (17-18 vuotiaat)',
  'lukio_3': 'Lukio 3. vuosi (18-19 vuotiaat)',
  'ammattikoulu': 'Ammatillinen koulutus (16+ vuotiaat)',
  'korkeakoulu': 'Korkeakoulutaso (18+ vuotiaat)'
};

// Subject mappings for Finnish curriculum
export const SUBJECTS = {
  'matematiikka': 'Matematiikka',
  'suomen_kieli': 'Suomen kieli ja kirjallisuus',
  'ruotsin_kieli': 'Ruotsin kieli',
  'englannin_kieli': 'Englannin kieli',
  'historia': 'Historia',
  'yhteiskuntaoppi': 'Yhteiskuntaoppi',
  'maantieto': 'Maantieto',
  'biologia': 'Biologia',
  'fysiikka': 'Fysiikka',
  'kemia': 'Kemia',
  'terveystieto': 'Terveystieto',
  'liikunta': 'Liikunta',
  'musiikki': 'Musiikki',
  'kuvataide': 'Kuvataide',
  'kasityot': 'Käsityöt',
  'kotitalous': 'Kotitalous',
  'uskonto': 'Uskonto/Elämänkatsomustieto'
};

// Content type configuration
export const CONTENT_TYPES = {
  quiz: { 
    credits: 2, 
    icon: 'quiz', 
    description: 'Interaktiivinen testi',
    template: QUIZ_GENERATION_PROMPT 
  },
  course: { 
    credits: 8, 
    icon: 'book', 
    description: 'Moniosainen kurssi',
    template: COURSE_GENERATION_PROMPT 
  },
  presentation: { 
    credits: 5, 
    icon: 'presentation', 
    description: 'Diaesitys',
    template: PRESENTATION_GENERATION_PROMPT 
  },
  exercise: { 
    credits: 3, 
    icon: 'pencil', 
    description: 'Harjoitustehtävät',
    template: EXERCISE_GENERATION_PROMPT 
  }
};

// Helper function to build prompts
export function buildEducationalPrompt(
  contentType: keyof typeof CONTENT_TYPES,
  subject: string,
  gradeLevel: string,
  language: string = 'fi',
  additionalParams: Record<string, string> = {}
): string {
  let template = CONTENT_TYPES[contentType].template;
  
  // Replace template variables
  template = template.replace(/\{subject\}/g, subject);
  template = template.replace(/\{grade_level\}/g, gradeLevel);
  template = template.replace(/\{language\}/g, language);
  
  // Replace additional parameters
  Object.entries(additionalParams).forEach(([key, value]) => {
    template = template.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  });
  
  return template;
}