import csv, io
from math import gcd

def frac(x):
    s = round(abs(x) * 16)
    if s == 0:
        return '0'
    sign = '-' if x < 0 else '+'
    whole, rem = divmod(s, 16)
    if rem == 0:
        return sign + str(whole)
    g = gcd(rem, 16)
    f = str(rem // g) + '/' + str(16 // g)
    return sign + (str(whole) + ' ' + f if whole else f)

def status(v, tm, tp):
    e = 1e-9
    if v > tp + e or v < -tm - e:
        return 'FAIL'
    if abs(v - tp) < e or abs(v + tm) < e:
        return 'EDGE'
    return 'PASS'

def run(csv_text):
    rows = csv.DictReader(io.StringIO(csv_text))
    print('code,td_var,td_status,fac_var,fac_status,gap_td_minus_fac,gap_class')
    for r in rows:
        spec = float(r['Spec_M_Original'])
        tm, tp = float(r['Tol_Minus']), float(r['Tol_Plus'])
        td, fac = float(r['TD_Measured']), float(r['Factory_Measured'])
        tv, fv = td - spec, fac - spec
        ts, fs = status(tv, tm, tp), status(fv, tm, tp)
        gap = td - fac
        if abs(gap) < 1e-9:
            cls = 'MATCH'
        elif ts != fs:
            cls = 'CHANGES_STATUS'
        else:
            cls = 'NOISE'
        print(','.join([r['POM_Code'], frac(tv), ts, frac(fv), fs, frac(gap), cls]))

csv_text = '''POM_Code,POM_Description,Spec_M_Original,Tol_Minus,Tol_Plus,TD_Measured,Factory_Measured,Unit
L01,FRONT BODY LENGTH FROM HPS,28.5,0.5,0.5,28.5,28.5,in
S01,SHOULDER SLOPE (SET IN SLEEVE),2.25,0.125,0.125,2.5,2.5,in
S02,SHOULDER FORWARD,0.5,0.125,0.125,0.625,0.625,in'''
run(csv_text)
