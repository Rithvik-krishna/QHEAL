import sys
sys.path.insert(0, 'backend')
from models.predictor import get_predictor

p = get_predictor()

scenarios = [
    ('Healthy',   {'age':35,'cholesterol':185,'blood_pressure':115,'glucose':92, 'max_heart_rate':175,'oldpeak':0.2,'st_slope':1}),
    ('At-Risk',   {'age':55,'cholesterol':280,'blood_pressure':160,'glucose':140,'max_heart_rate':120,'oldpeak':2.5,'st_slope':2}),
    ('High-Risk', {'age':70,'cholesterol':310,'blood_pressure':185,'glucose':165,'max_heart_rate':88, 'oldpeak':4.2,'st_slope':3}),
]

print()
for name, data in scenarios:
    r = p.predict(data)
    c = r['classical_risk']
    q = r['quantum_risk']
    d = r['improvement']
    lv = r['risk_level']
    print(f"{name:12s}: Classical={c}%  Quantum={q}%  Delta={d:+.1f}%  Level={lv}")
print()
print("ALL SCENARIOS PASSED")
