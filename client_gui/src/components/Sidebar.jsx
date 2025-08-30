import { HomeIcon } from "@heroicons/react/solid";
import {
	ArrowUpIcon,
	BellIcon,
	BookmarkIcon,
	CalendarIcon,
	ChartBarIcon,
	ChatAltIcon,
	ClipboardCheckIcon,
	CogIcon,
	CreditCardIcon,
	DocumentSearchIcon,
	ExternalLinkIcon,
	MailIcon,
	PencilAltIcon,
	ShieldCheckIcon,
	UserIcon,
} from "@heroicons/react/outline";
import { Button, Col, Grid } from "@tremor/react";
import styled from "styled-components";

const Description = styled.div`
  display: none;
  position: absolute;
  background-color: #111827;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  padding: 12px 16px;
  border-radius: 8px;
  top: -20px;
  left: 50px;
  color: white;
`;

const LinkWrapper = styled.a`
  &:hover ${Description} {
    display: block;
  }
`;

const Sidebar = () => {
	return (
		<>
			<div className="fixed left-3 sm:left-6 top-[20vh] mt-10">
				<Grid numItems={1}>
					<Col numColSpan={1}>
						<LinkWrapper href="/client-gui/dashboard">
							<Button variant="primary" color="red"
								className="p-2 rounded-lg mb-4">
								<HomeIcon width={20} />
							</Button>
							<Description>Dashboard</Description>
						</LinkWrapper>
					</Col>
					<Col numColSpan={1}>
						<LinkWrapper href="/client-gui/project">
							<Button variant="primary" color="indigo"
								className="p-2 rounded-lg mb-4">
								<ClipboardCheckIcon width={20} />
							</Button>
							<Description>Project Management</Description>
						</LinkWrapper>
					</Col>
					<Col numColSpan={1}>
						<LinkWrapper href="/client-gui/schedule">
							<Button variant="primary" color="indigo"
								className="p-2 rounded-lg mb-4">
								<CreditCardIcon width={20} />
							</Button>
							<Description>Optimize Your Tasks</Description>
						</LinkWrapper>
					</Col>
					<Col numColSpan={1}>
						<LinkWrapper href="/client-gui/calendar">
							<Button variant="primary" color="indigo"
								className="p-2 rounded-lg mb-4">
								<CalendarIcon width={20} />
							</Button>
							<Description>Daily Calendar</Description>
						</LinkWrapper>
					</Col>
					<Col numColSpan={1}>
						<LinkWrapper href="/client-gui/note-dashboard">
							<Button variant="primary" color="indigo"
								className="p-2 rounded-lg mb-4">
								<PencilAltIcon width={20} />
							</Button>
							<Description>Note </Description>
						</LinkWrapper>
					</Col>
					<Col numColSpan={1}>
						<LinkWrapper href="/client-gui/chat?dialogueId">
							<Button variant="primary" color="indigo"
								className="p-2 rounded-lg mb-4">
								<ChatAltIcon width={20} />
							</Button>
							<Description>Chat Bot</Description>
						</LinkWrapper>
					</Col>
					<Col numColSpan={1}>
						<LinkWrapper href="/client-gui/profile">
							<Button variant="primary" color="indigo"
								className="p-2 rounded-lg mb-4">
								<UserIcon width={20} />
							</Button>
							<Description>User Profile</Description>
						</LinkWrapper>
					</Col>
					{/* <Col numColSpan={1}>
						<LinkWrapper href="/client-gui/onboarding">
							<Button variant="primary" color="indigo"
								className="p-2 rounded-lg mb-4">
								<CogIcon width={20} />
							</Button>
							<Description>Onboarding </Description>
						</LinkWrapper>
					</Col> */}
				</Grid>

				{/* <ChartBarIcon
					width={40}
					className="bg-gray-600 p-2 rounded-lg mb-4 text-gray-300"
				/>
				<DocumentSearchIcon
					width={40}
					className="bg-gray-600 p-2 rounded-lg mb-4 text-gray-300"
				/> 
				<MailIcon
					width={40}
					className="bg-gray-600 p-2 rounded-lg mb-4 text-gray-300"
				/> */}
				<BellIcon
					width={40}
					className="bg-gray-600 p-2 rounded-lg mb-4 text-gray-300"
				/>
				{/* <Col numColSpan={1}>
					<LinkWrapper href="/client-gui/manager">
						<Button variant="primary" color="yellow"
							className="p-2 rounded-lg mb-4">
							<ShieldCheckIcon width={20} />
						</Button>
						<Description>Manager</Description>
					</LinkWrapper>
				</Col> */}
			</div>
			<div className="fixed bottom-4 left-3 sm:left-6">
				<a href="#top">
					<ArrowUpIcon
						width={40}
						className="bg-gray-600 p-2 rounded-lg mb-4 text-gray-300"
					/>
				</a>
				<Button variant="secondary" className="p-2" color="indigo" >
					<ExternalLinkIcon width={20} />
				</Button>
			</div>
		</>
	);
};

export default Sidebar;