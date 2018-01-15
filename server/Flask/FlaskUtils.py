def check_parameters(params=[], required=[], one_required=[]):
	'''checks for required parameters and parameters that you 
		need at least one to have a value

	Args
		params (list) all parameters given to method/function
		required (list) all required parameters
		one_required (list) need at least one parameter from this list

	Returns
		empty string if nothing missing or a string of missing args
	'''
	missing = ''

	# get any missing required keys
	missing_keys = [x for x in required if not params.get(x)]
	if missing_keys:
		missing = 'Missing the following required args: ' + ', '.join(missing_keys)

	# see if at least one key is given
	if one_required:
		one_key_needed = [x for x in one_required if not params.get(x)]

		if len(one_key_needed) == len(one_required):
			if missing:
				missing += ', and at least one of the following optional args: '
			else: 
				missing = 'Missing at least one of the following optional args: '
			# add missing optional args
			missing += ', '.join(one_required)

	# return result
	return missing