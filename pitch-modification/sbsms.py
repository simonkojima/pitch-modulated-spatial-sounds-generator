import os
exec_dir = os.path.join('sbsms-convert','sbsms-convert.exe')

def pitch_shift(f_name, f_save, pitch, verbose=False):
    cmd = str(exec_dir) + " " + str(f_name) + " " + str(f_save) + " 1 1 " + "%f %f" %(pitch, pitch)
    val = os.system(cmd)
    if verbose:
        print(cmd)
        print(val)