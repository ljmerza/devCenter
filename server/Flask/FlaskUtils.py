

def check_args(params, required):
	missing_keys = [x for x in required if x not in params]
	return ' '.join(missing_keys)
