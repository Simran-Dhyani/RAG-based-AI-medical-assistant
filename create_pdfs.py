from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import os

styles = getSampleStyleSheet()
title_style = ParagraphStyle('CustomTitle', parent=styles['Title'], fontSize=18, spaceAfter=16)
h2_style = ParagraphStyle('H2', parent=styles['Heading2'], fontSize=13, spaceAfter=8)
body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=11, spaceAfter=6, leading=16)

def make_pdf(filename, title, sections):
    doc = SimpleDocTemplate(f"/home/claude/medical-rag/pdfs/{filename}", pagesize=letter,
                            rightMargin=inch, leftMargin=inch, topMargin=inch, bottomMargin=inch)
    story = [Paragraph(title, title_style), Spacer(1, 12)]
    for heading, content in sections:
        story.append(Paragraph(heading, h2_style))
        for para in content:
            story.append(Paragraph(para, body_style))
        story.append(Spacer(1, 8))
    doc.build(story)
    print(f"Created: {filename}")

# PDF 1 - Hypertension
make_pdf("hypertension.pdf", "Hypertension (High Blood Pressure)", [
    ("What is Hypertension?", [
        "Hypertension is a condition where blood pressure in the arteries is persistently elevated. Normal blood pressure is below 120/80 mmHg. Hypertension is diagnosed when readings consistently exceed 140/90 mmHg.",
        "It is called the 'silent killer' because most people have no symptoms even when blood pressure is dangerously high."
    ]),
    ("Symptoms", [
        "Most people with hypertension have no symptoms. When symptoms do occur they may include: severe headaches, especially in the morning; nosebleeds; vision changes or blurred vision; chest pain or tightness; shortness of breath; dizziness or lightheadedness; blood in urine.",
        "A hypertensive crisis (blood pressure above 180/120) is a medical emergency with symptoms of severe headache, confusion, chest pain, and difficulty breathing."
    ]),
    ("Medicines", [
        "ACE inhibitors (enalapril, lisinopril) relax blood vessels by blocking a hormone that narrows them.",
        "Angiotensin receptor blockers (ARBs) such as losartan and telmisartan work similarly to ACE inhibitors.",
        "Calcium channel blockers (amlodipine, felodipine) relax blood vessel walls.",
        "Diuretics (hydrochlorothiazide, furosemide) reduce fluid in the body to lower pressure.",
        "Beta-blockers (metoprolol, atenolol) slow heart rate and reduce blood pressure."
    ]),
    ("Emergency Actions", [
        "If blood pressure exceeds 180/120 with symptoms: call emergency services (112 or 911) immediately.",
        "Have the patient sit calmly and rest. Do not allow physical exertion.",
        "If prescribed emergency medication (e.g., clonidine), administer as directed by doctor.",
        "Do NOT give aspirin unless chest pain suggests a heart attack.",
        "Monitor breathing and consciousness. Prepare to perform CPR if needed."
    ]),
    ("What You Should Do", [
        "Eat a low-salt, heart-healthy diet (DASH diet). Reduce sodium to less than 2300 mg per day.",
        "Exercise at least 30 minutes most days. Lose weight if overweight.",
        "Quit smoking and limit alcohol. Manage stress through meditation or yoga.",
        "Take prescribed medicines consistently. Never stop medications without consulting your doctor.",
        "Monitor blood pressure at home regularly and keep a log for your doctor."
    ])
])

# PDF 2 - Diabetes
make_pdf("diabetes.pdf", "Diabetes Mellitus", [
    ("What is Diabetes?", [
        "Diabetes is a chronic disease where the body cannot properly regulate blood sugar (glucose). Type 1 diabetes occurs when the body produces no insulin. Type 2 diabetes is when the body does not use insulin effectively.",
        "Gestational diabetes occurs during pregnancy. Pre-diabetes is when blood sugar is high but not yet in the diabetic range."
    ]),
    ("Symptoms", [
        "Type 1 symptoms appear suddenly: frequent urination, excessive thirst, extreme hunger, unexplained weight loss, fatigue, blurry vision, slow-healing sores.",
        "Type 2 symptoms develop slowly and may include the same signs plus frequent infections, numbness or tingling in hands and feet (neuropathy).",
        "Diabetic ketoacidosis (DKA) signs: fruity breath, nausea, vomiting, abdominal pain, confusion — this is an emergency."
    ]),
    ("Medicines", [
        "Insulin (rapid, short, intermediate, long-acting) is required for Type 1 and some Type 2 patients.",
        "Metformin is the first-line oral medication for Type 2 diabetes. It reduces glucose production in the liver.",
        "Sulfonylureas (glipizide, glibenclamide) stimulate the pancreas to produce more insulin.",
        "SGLT2 inhibitors (empagliflozin, dapagliflozin) cause kidneys to remove extra glucose via urine.",
        "GLP-1 receptor agonists (semaglutide, liraglutide) help control blood sugar and promote weight loss."
    ]),
    ("Emergency Actions", [
        "Hypoglycemia (low blood sugar below 70 mg/dL): give 15g fast-acting carbs (glucose tablets, juice, sugar). Recheck in 15 minutes. Call emergency if unconscious.",
        "Hyperglycemia emergency (DKA): seek emergency care immediately. Do not attempt home treatment.",
        "If unconscious and hypoglycemia suspected: do not give food/drink by mouth. Call 112/911. Give glucagon injection if available.",
        "Keep glucose tablets or juice accessible at all times."
    ]),
    ("What You Should Do", [
        "Monitor blood glucose regularly as advised by your doctor (fasting and post-meal readings).",
        "Follow a balanced diet with controlled carbohydrates, high fiber, and low sugar.",
        "Exercise 150 minutes per week of moderate activity to improve insulin sensitivity.",
        "Take all medications on schedule. Never skip insulin doses.",
        "Get regular eye, kidney, and foot checkups. Inspect feet daily for cuts or wounds."
    ])
])

# PDF 3 - Asthma
make_pdf("asthma.pdf", "Asthma", [
    ("What is Asthma?", [
        "Asthma is a chronic lung disease that causes inflammation and narrowing of the airways, making breathing difficult. It is characterized by recurring episodes of wheezing, breathlessness, and coughing.",
        "Triggers include allergens (dust, pollen, pet dander), air pollution, exercise, cold air, smoke, and respiratory infections."
    ]),
    ("Symptoms", [
        "Common symptoms: wheezing (whistling sound when breathing), chest tightness, shortness of breath, persistent cough especially at night or early morning.",
        "Severe attack signs: very rapid breathing, inability to complete sentences, blue lips or fingernails (cyanosis), no improvement after inhaler use — this is a medical emergency."
    ]),
    ("Medicines", [
        "Short-acting bronchodilators (salbutamol/albuterol) are rescue inhalers that quickly relax airway muscles during an attack.",
        "Inhaled corticosteroids (budesonide, beclomethasone) are controller medicines taken daily to reduce airway inflammation.",
        "Long-acting beta-agonists (salmeterol, formoterol) are used with inhaled steroids for long-term control.",
        "Montelukast (Singulair) is an oral leukotriene modifier for mild persistent asthma.",
        "Oral corticosteroids (prednisolone) are used for severe flare-ups under medical supervision."
    ]),
    ("Emergency Actions", [
        "During an attack: sit the patient upright. Give 4-8 puffs of reliever inhaler (salbutamol) every 20 minutes.",
        "If no improvement in 20 minutes or breathing is severely labored, call 112/911 immediately.",
        "In a hospital setting, nebulized bronchodilators, oxygen, and IV corticosteroids are used.",
        "Do not leave someone with a severe attack alone."
    ]),
    ("What You Should Do", [
        "Identify and avoid your personal asthma triggers. Use air purifiers if needed.",
        "Take controller medications daily even when feeling well. Never stop without doctor advice.",
        "Always carry your rescue inhaler. Know how to use a spacer device for better delivery.",
        "Follow your Asthma Action Plan — a written plan from your doctor for managing symptoms.",
        "Get the flu vaccine annually. Manage stress and maintain a healthy weight."
    ])
])

# PDF 4 - Heart Disease
make_pdf("heart_disease.pdf", "Heart Disease (Coronary Artery Disease)", [
    ("What is Heart Disease?", [
        "Coronary artery disease (CAD) occurs when the arteries supplying blood to the heart become narrowed or blocked by plaque buildup (atherosclerosis).",
        "It is the leading cause of death worldwide. Risk factors include high blood pressure, high cholesterol, diabetes, smoking, obesity, and family history."
    ]),
    ("Symptoms", [
        "Angina (chest pain or pressure) is the most common symptom, often triggered by physical activity or stress and relieved by rest.",
        "Heart attack symptoms: crushing chest pain or pressure, pain radiating to left arm, jaw, back or neck, shortness of breath, cold sweat, nausea, lightheadedness.",
        "Some people, especially women and diabetics, may have atypical symptoms like fatigue, indigestion, or jaw pain."
    ]),
    ("Medicines", [
        "Aspirin (75-100mg daily) prevents blood clots. Essential after a heart attack unless contraindicated.",
        "Statins (atorvastatin, rosuvastatin) lower LDL cholesterol and reduce plaque buildup.",
        "ACE inhibitors and ARBs protect heart muscle, especially after a heart attack.",
        "Beta-blockers (metoprolol, carvedilol) reduce heart workload and prevent arrhythmias.",
        "Nitroglycerin (sublingual tablet or spray) quickly relieves angina by dilating blood vessels."
    ]),
    ("Emergency Actions", [
        "HEART ATTACK EMERGENCY: Call 112/911 immediately. Do not drive yourself to hospital.",
        "Give 300mg aspirin to chew (not swallow whole) if the patient is not allergic and is conscious.",
        "Have the patient rest in a comfortable position (semi-sitting is best if breathing is difficult).",
        "If trained, be ready to perform CPR if the patient loses consciousness and stops breathing.",
        "Use an AED (automated defibrillator) if available and patient is in cardiac arrest."
    ]),
    ("What You Should Do", [
        "Follow a heart-healthy diet: rich in fruits, vegetables, whole grains, lean proteins; low in saturated fats, trans fats, and sodium.",
        "Exercise 150 minutes per week at moderate intensity. Quit smoking — it is the single most important lifestyle change.",
        "Take all heart medications as prescribed. Never skip doses, especially statins and aspirin.",
        "Monitor and control blood pressure, cholesterol, and blood sugar.",
        "Attend all cardiac follow-up appointments and get recommended tests (ECG, stress test, echocardiogram)."
    ])
])

# PDF 5 - Dengue
make_pdf("dengue.pdf", "Dengue Fever", [
    ("What is Dengue?", [
        "Dengue fever is a viral infection transmitted by the Aedes aegypti mosquito, primarily in tropical and subtropical regions including India.",
        "There are 4 dengue virus serotypes. Infection with one type provides lifelong immunity to that type but not the others. Second infections can be more severe."
    ]),
    ("Symptoms", [
        "Classic dengue: sudden high fever (40 degrees C), severe headache, pain behind the eyes, muscle and joint pain (breakbone fever), skin rash, nausea and vomiting.",
        "Symptoms appear 4-10 days after mosquito bite and last 2-7 days.",
        "Warning signs of severe dengue: severe abdominal pain, persistent vomiting, bleeding gums, blood in vomit or stool, rapid breathing, fatigue, restlessness. Seek care immediately."
    ]),
    ("Medicines", [
        "There is NO specific antiviral medicine for dengue. Treatment is supportive.",
        "Paracetamol (acetaminophen) for fever and pain. Do NOT use ibuprofen, aspirin, or naproxen as they increase bleeding risk.",
        "Oral rehydration salts (ORS) for fluid replacement. IV fluids in hospital for severe cases.",
        "Platelet transfusion only when platelet count drops below 10,000 or with active severe bleeding."
    ]),
    ("Emergency Actions", [
        "Go to hospital immediately if warning signs appear (see above).",
        "Monitor platelet count daily during the critical phase (days 3-7 of illness).",
        "Maintain fluid intake of at least 2-3 liters per day of water, coconut water, or ORS.",
        "Do not give aspirin or ibuprofen under any circumstances.",
        "Watch for signs of dengue shock: rapid weak pulse, cold clammy skin, confusion — call 112 immediately."
    ]),
    ("What You Should Do", [
        "Prevent mosquito bites: use DEET-based repellents, wear full-sleeve clothing, use bed nets.",
        "Eliminate mosquito breeding: empty standing water from containers, flower pots, coolers weekly.",
        "Rest adequately and maintain good nutrition during illness.",
        "Follow up with doctor for repeat blood counts every 24-48 hours during illness.",
        "The dengue vaccine (Dengvaxia) is available but only recommended for those previously infected."
    ])
])

# PDF 6 - Tuberculosis
make_pdf("tuberculosis.pdf", "Tuberculosis (TB)", [
    ("What is Tuberculosis?", [
        "Tuberculosis is a bacterial infection caused by Mycobacterium tuberculosis, primarily affecting the lungs (pulmonary TB) but can affect other organs.",
        "TB spreads through the air when infected people cough, sneeze, or speak. Latent TB means bacteria are present but not active (no symptoms, not contagious). Active TB means the bacteria are multiplying and the person is sick and contagious."
    ]),
    ("Symptoms", [
        "Pulmonary TB symptoms: persistent cough lasting more than 2 weeks, coughing up blood or mucus, chest pain, fever (especially afternoon), night sweats, unexplained weight loss, fatigue.",
        "Extrapulmonary TB can cause swollen lymph nodes, back pain (spinal TB), headache and neck stiffness (TB meningitis), abdominal pain (abdominal TB)."
    ]),
    ("Medicines", [
        "TB treatment uses a combination of antibiotics to prevent resistance. Standard first-line treatment is 6 months.",
        "Intensive phase (2 months): isoniazid, rifampicin, pyrazinamide, and ethambutol (HRZE).",
        "Continuation phase (4 months): isoniazid and rifampicin (HR).",
        "All TB treatment in India is free under the National TB Elimination Programme (NTEP).",
        "Drug-resistant TB (MDR-TB) requires longer treatment (18-24 months) with second-line drugs."
    ]),
    ("Emergency Actions", [
        "Severe hemoptysis (coughing large amounts of blood): call 112 immediately. Keep patient sitting upright.",
        "TB meningitis signs (severe headache, stiff neck, confusion): emergency hospitalization required.",
        "Respiratory failure due to TB: oxygen therapy and ICU care needed.",
        "Notify public health authorities of active TB cases as required by law."
    ]),
    ("What You Should Do", [
        "Complete the FULL course of treatment — never stop early even if feeling better. Incomplete treatment causes drug resistance.",
        "Take medicines at the same time every day. Consider directly observed therapy (DOT) for support.",
        "Cover mouth when coughing or sneezing. Ensure good ventilation in living spaces.",
        "All close contacts (family members) should be screened for TB.",
        "People with HIV are at much higher risk of TB and need regular screening."
    ])
])

# PDF 7 - Malaria
make_pdf("malaria.pdf", "Malaria", [
    ("What is Malaria?", [
        "Malaria is a life-threatening disease caused by Plasmodium parasites transmitted through the bite of infected female Anopheles mosquitoes.",
        "Main species: P. falciparum (most dangerous, common in India), P. vivax (causes relapses), P. malariae, P. ovale. P. falciparum can cause cerebral malaria, a medical emergency."
    ]),
    ("Symptoms", [
        "Classic malaria cycle: chills and shivering, then high fever (up to 41C), then heavy sweating as fever breaks. This cycle repeats every 48-72 hours depending on parasite species.",
        "Other symptoms: headache, muscle aches, nausea, vomiting, fatigue.",
        "Severe malaria warning signs: altered consciousness, seizures, difficulty breathing, abnormal bleeding, severe anemia, jaundice, very high fever, dark or bloody urine (blackwater fever)."
    ]),
    ("Medicines", [
        "P. falciparum treatment: artemisinin-based combination therapy (ACT) such as artemether-lumefantrine or artesunate-amodiaquine.",
        "P. vivax treatment: chloroquine plus primaquine (primaquine eliminates liver stage to prevent relapses). G6PD testing required before primaquine.",
        "Severe malaria: IV artesunate is the drug of choice in hospital settings.",
        "Chemoprophylaxis for travelers: doxycycline, atovaquone-proguanil (Malarone), or mefloquine depending on region."
    ]),
    ("Emergency Actions", [
        "Severe malaria is a medical emergency. Seek hospital care immediately.",
        "Do not delay treatment waiting for test results if severe malaria is clinically suspected.",
        "IV artesunate should be started within 1 hour of diagnosis of severe malaria.",
        "Monitor blood glucose regularly — malaria and its treatment can cause hypoglycemia.",
        "Seizure management: protect airway, give diazepam for convulsions, call 112."
    ]),
    ("What You Should Do", [
        "Sleep under insecticide-treated bed nets (ITNs) especially in endemic areas.",
        "Use mosquito repellents (DEET) and wear protective clothing at dawn and dusk.",
        "Seek diagnosis (rapid test or blood smear) within 24 hours of fever onset in endemic areas.",
        "Complete the full course of antimalarial treatment as prescribed.",
        "Drain standing water around homes. Report malaria cases to local health authorities."
    ])
])

# PDF 8 - Stroke
make_pdf("stroke.pdf", "Stroke (Brain Attack)", [
    ("What is a Stroke?", [
        "A stroke occurs when blood supply to part of the brain is cut off, either by a clot blocking an artery (ischemic stroke, 87%) or by a blood vessel rupturing (hemorrhagic stroke).",
        "A transient ischemic attack (TIA or mini-stroke) causes temporary symptoms and is a major warning sign of an impending stroke."
    ]),
    ("Symptoms — Use FAST", [
        "F - Face drooping: Ask the person to smile. Is one side drooping?",
        "A - Arm weakness: Ask them to raise both arms. Does one arm drift downward?",
        "S - Speech difficulty: Is speech slurred, garbled, or unable to speak?",
        "T - Time to call 112/911: If ANY of these signs are present, call emergency services IMMEDIATELY.",
        "Other symptoms: sudden severe headache ('thunderclap'), vision loss in one or both eyes, sudden loss of balance or coordination, confusion."
    ]),
    ("Medicines", [
        "Ischemic stroke: tPA (alteplase) is a clot-busting drug given within 4.5 hours of symptom onset at hospital.",
        "Mechanical thrombectomy (clot removal procedure) possible within 24 hours at specialized centers.",
        "Long-term prevention: aspirin or clopidogrel (antiplatelet), anticoagulants (warfarin, rivaroxaban) if atrial fibrillation is present.",
        "Statins and antihypertensive medications are essential for stroke prevention.",
        "Hemorrhagic stroke treatment: blood pressure control, reversal of anticoagulation, possible surgery."
    ]),
    ("Emergency Actions", [
        "CALL 112/911 IMMEDIATELY. Note the exact time symptoms started — this is critical for treatment.",
        "Do NOT give food, water, or any medications by mouth — the person may be unable to swallow.",
        "Do not let the patient sleep it off. Every minute counts: 'Time is Brain.'",
        "If the patient is unconscious, check breathing and put in recovery position.",
        "Go to the nearest stroke-ready hospital (comprehensive stroke center if available)."
    ]),
    ("What You Should Do", [
        "Control stroke risk factors: hypertension, diabetes, high cholesterol, atrial fibrillation.",
        "Quit smoking, limit alcohol, exercise regularly, maintain healthy weight.",
        "Take all prescribed medications consistently. Do not skip anticoagulants.",
        "After a stroke: follow rehabilitation plan (physiotherapy, speech therapy, occupational therapy).",
        "Recognize TIA symptoms and seek emergency care — it is a warning that a major stroke may follow."
    ])
])

# PDF 9 - COVID-19
make_pdf("covid19.pdf", "COVID-19 (Coronavirus Disease)", [
    ("What is COVID-19?", [
        "COVID-19 is an infectious respiratory illness caused by the SARS-CoV-2 coronavirus. It spreads primarily through respiratory droplets and aerosols from infected people.",
        "Most people experience mild to moderate illness. Older adults and those with comorbidities (diabetes, heart disease, immunocompromised) are at higher risk of severe disease."
    ]),
    ("Symptoms", [
        "Common symptoms: fever, cough, fatigue, loss of taste or smell, sore throat, headache, body aches, runny nose, diarrhea.",
        "Severe symptoms requiring urgent care: difficulty breathing, persistent chest pain or pressure, confusion, inability to stay awake, bluish lips or face.",
        "Long COVID symptoms (lasting weeks-months): fatigue, brain fog, shortness of breath, joint pain, depression."
    ]),
    ("Medicines", [
        "Mild cases: rest, hydration, paracetamol for fever. Isolation for at least 5 days.",
        "Antiviral medications for high-risk patients: nirmatrelvir-ritonavir (Paxlovid), remdesivir, or molnupiravir — must be started within 5 days of symptoms.",
        "Severe cases: dexamethasone (corticosteroid) reduces mortality in hospitalized patients needing oxygen.",
        "Anticoagulants are used to prevent blood clots in hospitalized patients.",
        "There is NO role for antibiotics unless a bacterial superinfection is confirmed."
    ]),
    ("Emergency Actions", [
        "Seek emergency care if: SpO2 drops below 94%, breathing becomes labored, persistent chest pain, confusion.",
        "Monitor oxygen levels at home with a pulse oximeter if available.",
        "In COVID pneumonia: prone positioning (lying face down) can improve oxygenation at home.",
        "Call 112 if the patient becomes unresponsive or stops breathing normally."
    ]),
    ("What You Should Do", [
        "Stay up to date with COVID-19 vaccinations and boosters.",
        "Wear well-fitted masks in crowded indoor settings.",
        "Isolate if tested positive to prevent spread to others.",
        "Maintain good ventilation indoors. Wash hands frequently.",
        "Seek medical care early if symptoms worsen, especially if you have risk factors."
    ])
])

# PDF 10 - First Aid & Emergency
make_pdf("first_aid_emergency.pdf", "First Aid and Medical Emergencies", [
    ("Cardiac Arrest", [
        "Signs: unresponsive, not breathing or only gasping, no pulse.",
        "Call 112/911 immediately. Begin CPR: 30 chest compressions (hard and fast) followed by 2 rescue breaths. Repeat.",
        "Use AED as soon as available. Turn on, follow voice instructions, deliver shock if advised.",
        "Continue CPR until emergency services arrive or patient recovers."
    ]),
    ("Choking", [
        "Mild choking (can cough): encourage forceful coughing. Do not interfere.",
        "Severe choking (cannot breathe, cough, or speak): Give 5 back blows between shoulder blades with heel of hand.",
        "Then give 5 abdominal thrusts (Heimlich maneuver): stand behind person, make fist above navel, thrust inward and upward.",
        "Alternate back blows and abdominal thrusts. Call 112 if object not dislodged.",
        "For infants: use 5 back blows and 5 chest thrusts. Never do abdominal thrusts on infants."
    ]),
    ("Severe Bleeding", [
        "Apply direct firm pressure to the wound with a clean cloth or bandage.",
        "Do not remove the cloth if it soaks through — add more on top.",
        "Elevate the injured limb above heart level if possible.",
        "For limb bleeding that cannot be controlled: apply a tourniquet 5-7 cm above the wound. Note the time.",
        "Call 112. Keep patient warm and calm. Do not give food or water."
    ]),
    ("Severe Allergic Reaction (Anaphylaxis)", [
        "Signs: hives, facial swelling, throat swelling, difficulty breathing, drop in blood pressure, loss of consciousness.",
        "Give epinephrine (adrenaline) auto-injector (EpiPen) into outer thigh immediately if available.",
        "Call 112 immediately even if symptoms improve after EpiPen. Effects are temporary.",
        "Lay patient flat with legs elevated (unless breathing difficulty, then sit up).",
        "Second EpiPen dose can be given after 5-15 minutes if no improvement."
    ]),
    ("Burns", [
        "Cool the burn with cool (not cold/icy) running water for 20 minutes. Do not use ice, butter, or toothpaste.",
        "Cover with a clean non-fluffy material (cling film or clean plastic bag).",
        "Call 112 for: burns larger than palm of hand, deep burns, burns on face/hands/genitals, inhalation injury.",
        "Do not pop blisters. Remove jewelry near the burn area. Give paracetamol for pain."
    ]),
    ("Fractures and Sprains", [
        "Immobilize the injured area. Do not try to straighten a broken bone.",
        "Apply a splint using rigid material padded with soft material. Extend splint beyond joints above and below fracture.",
        "Apply ice pack (wrapped in cloth) to reduce swelling. Elevate if possible.",
        "Open fractures (bone piercing skin): cover wound with clean dressing. Call 112 immediately.",
        "Seek medical evaluation for all suspected fractures."
    ])
])

print("\nAll 10 PDFs created successfully in /home/claude/medical-rag/pdfs/")
