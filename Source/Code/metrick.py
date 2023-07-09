def calc(source, result):
    tp, tn, fp, fn = 0, 0, 0, 0
    for i in range(len(source)):
        s, r = bool(source[i]), bool(result[i])
        if s and r:
            tp+=1
        elif s and not r:
            fn+=1
        elif not s and r:
            fp+=1
        elif not(s or r):
            tn+=1
    print("TP =", tp, " TN =", tn, " FP =", fp, " FN =", fn)

    P, R = tp/(tp+fp), tp/(tp+fn)
    F = (2*P*R)/(P+R)
    print("P =", round(P*100, 2), "% R =", round(R*100, 2), "% F =", round(F*100, 2), "%")

sr = [0,1,0,1,0,0,1,0,1,0,0,0,0,1,1,1]
rt = [1,1,0,1,0,0,1,0,1,1,0,1,0,1,0,0]

print("1 detect:")
calc(sr, rt)
print("0 detect:")
for i in range(len(sr)):
    sr[i] = 1-sr[i]
    rt[i] = 1-rt[i]
calc(sr, rt)