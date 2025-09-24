"use server"

import { 
	getFeaturedPortfolios, 
	getActivePortfolios,
	getAllEventsPortfolios, 
	getPastEventPortfolios, 
	getUpcomingEventPortfolios 
} from "@/lib/notion/portfolios"
import {
	getActiveMembers,
	getLeads,
	getSeniorMembers,
	getAcademicAdvisors,
	getMembersByDepartment
} from "@/lib/notion/members"

export async function fetchFeaturedPortfolios() {
	return await getFeaturedPortfolios();
}

export async function fetchActivePortfolios() {
	return await getActivePortfolios();
}

export async function fetchAllEventsPortfolios() {
	return await getAllEventsPortfolios();
}

export async function fetchPastEventPortfolios() {
	return await getPastEventPortfolios();
}

export async function fetchUpcomingEventPortfolios() {
	return await getUpcomingEventPortfolios();
}

export async function fetchActiveMembers() {
	return await getActiveMembers();
}

export async function fetchLeads() {
	return await getLeads();
}

export async function fetchSeniorMembers() {
	return await getSeniorMembers();
}

export async function fetchAcademicAdvisors() {
	return await getAcademicAdvisors();
}

export async function fetchMembersByDepartment(department: string) {
	return await getMembersByDepartment(department);
}